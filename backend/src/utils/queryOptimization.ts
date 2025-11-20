/**
 * 查询优化工具函数
 * 提供常用的优化查询方法
 */

import { Question } from '../models/Question';
import { QuizSession } from '../models/QuizSession';
import { Submission } from '../models/Submission';
import { User } from '../models/User';
import { QuestionAnalysis } from '../models/QuestionAnalysis';

/**
 * 分页查询配置
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 分页查询结果
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * 通用分页查询
 */
export async function paginateQuery<T>(
  model: any,
  filter: any = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;
  const sortField = options.sort || 'createdAt';
  const sortOrder = options.order === 'asc' ? 1 : -1;

  // 并行执行查询和计数
  const [data, total] = await Promise.all([
    model
      .find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(), // 使用 lean() 提高性能
    model.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * 获取用户的测验列表（优化版）
 */
export async function getUserQuizzes(
  userId: string,
  options: PaginationOptions = {}
) {
  return paginateQuery(
    QuizSession,
    { createdBy: userId },
    options
  );
}

/**
 * 获取测验及其问题（优化版）
 */
export async function getQuizWithQuestions(quizId: string) {
  // 使用 lean() 和 select 优化查询
  const quiz = await QuizSession
    .findById(quizId)
    .populate({
      path: 'questions',
      select: 'title content options correctAnswer difficulty explanation',
      options: { lean: true }
    })
    .lean();

  return quiz;
}

/**
 * 获取学生的提交记录（优化版）
 */
export async function getStudentSubmissions(
  studentId: string,
  options: PaginationOptions = {}
) {
  return paginateQuery(
    Submission,
    { studentId },
    { ...options, sort: 'submitTime', order: 'desc' }
  );
}

/**
 * 批量获取问题的 AI 分析
 */
export async function getBatchQuestionAnalyses(questionIds: string[]) {
  // 使用 $in 操作符批量查询
  const analyses = await QuestionAnalysis
    .find({ questionId: { $in: questionIds } })
    .select('questionId analysis')
    .lean();

  // 转换为 Map 方便查找
  const analysisMap = new Map();
  analyses.forEach(analysis => {
    analysisMap.set(analysis.questionId.toString(), analysis.analysis);
  });

  return analysisMap;
}

/**
 * 获取测验统计信息（优化版）
 */
export async function getQuizStatistics(quizId: string) {
  // 使用聚合管道一次性获取所有统计信息
  const stats = await Submission.aggregate([
    { $match: { quizId } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        averageScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' },
        averageTime: { $avg: '$timeSpent' }
      }
    }
  ]);

  return stats[0] || {
    totalSubmissions: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    averageTime: 0
  };
}

/**
 * 搜索问题（优化版）
 */
export async function searchQuestions(
  searchTerm: string,
  userId?: string,
  options: PaginationOptions = {}
) {
  const filter: any = {
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } }
    ]
  };

  if (userId) {
    filter.createdBy = userId;
  }

  return paginateQuery(Question, filter, options);
}

/**
 * 获取热门标签
 */
export async function getPopularTags(limit: number = 10) {
  const tags = await Question.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);

  return tags.map(tag => ({
    name: tag._id,
    count: tag.count
  }));
}

/**
 * 获取用户统计信息
 */
export async function getUserStatistics(userId: string, role: 'teacher' | 'student') {
  if (role === 'teacher') {
    // 老师统计
    const [quizCount, questionCount] = await Promise.all([
      QuizSession.countDocuments({ createdBy: userId }),
      Question.countDocuments({ createdBy: userId })
    ]);

    // 获取测验的总提交数
    const quizzes = await QuizSession.find({ createdBy: userId }).select('_id').lean();
    const quizIds = quizzes.map(q => q._id.toString());
    const totalSubmissions = await Submission.countDocuments({ 
      quizId: { $in: quizIds } 
    });

    return {
      quizCount,
      questionCount,
      totalSubmissions
    };
  } else {
    // 学生统计
    const submissions = await Submission.find({ studentId: userId }).lean();
    
    const totalQuizzes = submissions.length;
    const averageScore = submissions.length > 0
      ? submissions.reduce((sum, s) => sum + (s.score / s.totalQuestions * 100), 0) / submissions.length
      : 0;
    const totalTimeSpent = submissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);

    return {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      totalTimeSpent
    };
  }
}

/**
 * 批量检查问题是否存在
 */
export async function checkQuestionsExist(questionIds: string[]): Promise<boolean> {
  const count = await Question.countDocuments({
    _id: { $in: questionIds }
  });
  
  return count === questionIds.length;
}

/**
 * 获取最近活跃的测验
 */
export async function getRecentActiveQuizzes(limit: number = 10) {
  return QuizSession
    .find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('title description createdBy createdAt')
    .lean();
}
