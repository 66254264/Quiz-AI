import { Request, Response } from 'express';
import { Submission } from '../models/Submission';
import { QuizSession } from '../models/QuizSession';
import { User } from '../models/User';
import { Question } from '../models/Question';
import { QuestionAnalysis } from '../models/QuestionAnalysis';
import { analyzeQuestionWithAI } from '../services/doubaoService';

// 获取整体统计数据
export const getOverallStatistics = async (req: Request, res: Response) => {
  try {
    const { quizId, startDate, endDate } = req.query;

    // 构建查询条件
    const query: any = {};
    if (quizId) {
      query.quizId = quizId;
    }
    if (startDate || endDate) {
      query.submitTime = {};
      if (startDate) {
        query.submitTime.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.submitTime.$lte = new Date(endDate as string);
      }
    }

    // 获取提交数据
    const submissions = await Submission.find(query)
      .populate('studentId', 'username email profile')
      .populate('quizId', 'title');

    // 计算统计数据
    const totalSubmissions = submissions.length;
    const totalStudents = new Set(submissions.map(s => s.studentId.toString())).size;
    
    const averageScore = totalSubmissions > 0
      ? submissions.reduce((sum, s) => sum + s.score, 0) / totalSubmissions
      : 0;
    
    const averagePercentage = totalSubmissions > 0
      ? submissions.reduce((sum, s) => sum + (s.score / s.totalQuestions * 100), 0) / totalSubmissions
      : 0;
    
    const averageTimeSpent = totalSubmissions > 0
      ? submissions.reduce((sum, s) => sum + s.timeSpent, 0) / totalSubmissions
      : 0;

    // 分数分布
    const scoreDistribution = {
      excellent: submissions.filter(s => (s.score / s.totalQuestions) >= 0.9).length,
      good: submissions.filter(s => (s.score / s.totalQuestions) >= 0.7 && (s.score / s.totalQuestions) < 0.9).length,
      average: submissions.filter(s => (s.score / s.totalQuestions) >= 0.6 && (s.score / s.totalQuestions) < 0.7).length,
      poor: submissions.filter(s => (s.score / s.totalQuestions) < 0.6).length
    };

    res.json({
      success: true,
      data: {
        totalSubmissions,
        totalStudents,
        averageScore: Math.round(averageScore * 100) / 100,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        averageTimeSpent: Math.round(averageTimeSpent),
        scoreDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching overall statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch overall statistics',
        code: 'STATISTICS_FETCH_ERROR'
      }
    });
  }
};

// 获取按题目统计数据
export const getQuestionStatistics = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const { sortBy = 'difficulty', order = 'desc' } = req.query;

    // 使用优化的查询获取测验信息
    const { getQuizWithQuestions } = await import('../utils/queryOptimization');
    const quiz = await getQuizWithQuestions(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Quiz not found',
          code: 'QUIZ_NOT_FOUND'
        }
      });
    }

    // 获取该测验的所有提交（使用 lean() 优化）
    const submissions = await Submission.find({ quizId }).lean();
    console.log(`📊 Found ${submissions.length} submissions for quiz ${quizId}`);

    // 批量获取所有问题（避免循环查询）
    const questionIds = quiz.questions.map((q: any) => q._id);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    const questionsMap = new Map(questions.map(q => [q._id.toString(), q]));

    // 统计每个题目的数据
    const questionStats = questionIds.map((questionId: any) => {
      const question = questionsMap.get(questionId.toString());
      if (!question) {
        console.warn(`⚠️ Question ${questionId} not found`);
        return null;
      }

      // 统计该题目的答题情况
      const questionAnswers = submissions.flatMap(s => 
        s.answers.filter(a => a.questionId.toString() === questionId.toString())
      );

      const totalAttempts = questionAnswers.length;
      const correctAttempts = questionAnswers.filter(a => a.isCorrect).length;
      const correctRate = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

      // 统计每个选项的选择次数
      const optionStats = question.options.map((option: any) => {
        const selectedCount = questionAnswers.filter(a => a.selectedAnswer === option.id).length;
        return {
          optionId: option.id,
          optionText: option.text,
          selectedCount,
          percentage: totalAttempts > 0 ? (selectedCount / totalAttempts) * 100 : 0,
          isCorrect: option.id === question.correctAnswer
        };
      });

      return {
        questionId: question._id,
        title: question.title,
        content: question.content,
        difficulty: question.difficulty,
        totalAttempts,
        correctAttempts,
        correctRate: Math.round(correctRate * 100) / 100,
        optionStats
      };
    }).filter(stat => stat !== null);

    // 排序
    if (sortBy === 'difficulty') {
      const difficultyOrder: any = { easy: 1, medium: 2, hard: 3 };
      questionStats.sort((a, b) => {
        const orderMultiplier = order === 'asc' ? 1 : -1;
        return (difficultyOrder[a!.difficulty] - difficultyOrder[b!.difficulty]) * orderMultiplier;
      });
    } else if (sortBy === 'correctRate') {
      questionStats.sort((a, b) => {
        const orderMultiplier = order === 'asc' ? 1 : -1;
        return (a!.correctRate - b!.correctRate) * orderMultiplier;
      });
    } else if (sortBy === 'attempts') {
      questionStats.sort((a, b) => {
        const orderMultiplier = order === 'asc' ? 1 : -1;
        return (a!.totalAttempts - b!.totalAttempts) * orderMultiplier;
      });
    }

    res.json({
      success: true,
      data: {
        quizId: quiz._id,
        quizTitle: quiz.title,
        totalQuestions: questionStats.length,
        questionStats
      }
    });
  } catch (error) {
    console.error('Error fetching question statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch question statistics',
        code: 'QUESTION_STATISTICS_ERROR'
      }
    });
  }
};

// 获取学生表现分析
export const getStudentPerformance = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const { sortBy = 'score', order = 'desc', minScore, maxScore } = req.query;

    // 构建查询条件
    const query: any = { quizId };
    if (minScore !== undefined || maxScore !== undefined) {
      query.score = {};
      if (minScore !== undefined) {
        query.score.$gte = Number(minScore);
      }
      if (maxScore !== undefined) {
        query.score.$lte = Number(maxScore);
      }
    }

    // 获取提交数据
    const submissions = await Submission.find(query)
      .populate('studentId', 'username email profile')
      .populate('quizId', 'title');

    // 构建学生表现数据
    let studentPerformance = submissions.map(submission => {
      const student = submission.studentId as any;
      const percentage = (submission.score / submission.totalQuestions) * 100;
      
      return {
        studentId: student._id,
        studentName: `${student.profile.lastName} ${student.profile.firstName}`,
        username: student.username,
        email: student.email,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        percentage: Math.round(percentage * 100) / 100,
        timeSpent: submission.timeSpent,
        submitTime: submission.submitTime,
        correctAnswers: submission.answers.filter((a: any) => a.isCorrect).length,
        incorrectAnswers: submission.answers.filter((a: any) => !a.isCorrect).length
      };
    });

    // 排序
    if (sortBy === 'score') {
      studentPerformance.sort((a, b) => {
        const orderMultiplier = order === 'asc' ? 1 : -1;
        return (a.score - b.score) * orderMultiplier;
      });
    } else if (sortBy === 'percentage') {
      studentPerformance.sort((a, b) => {
        const orderMultiplier = order === 'asc' ? 1 : -1;
        return (a.percentage - b.percentage) * orderMultiplier;
      });
    } else if (sortBy === 'timeSpent') {
      studentPerformance.sort((a, b) => {
        const orderMultiplier = order === 'asc' ? 1 : -1;
        return (a.timeSpent - b.timeSpent) * orderMultiplier;
      });
    } else if (sortBy === 'submitTime') {
      studentPerformance.sort((a, b) => {
        const orderMultiplier = order === 'asc' ? 1 : -1;
        return (new Date(a.submitTime).getTime() - new Date(b.submitTime).getTime()) * orderMultiplier;
      });
    }

    // 添加排名
    studentPerformance = studentPerformance.map((student, index) => ({
      ...student,
      rank: index + 1
    }));

    res.json({
      success: true,
      data: {
        totalStudents: studentPerformance.length,
        students: studentPerformance
      }
    });
  } catch (error) {
    console.error('Error fetching student performance:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch student performance',
        code: 'STUDENT_PERFORMANCE_ERROR'
      }
    });
  }
};

// 获取所有测验列表（用于筛选）
export const getQuizList = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.userId;

    const quizzes = await QuizSession.find({ createdBy: teacherId })
      .select('_id title createdAt isActive')
      .sort({ createdAt: -1 });

    // 为每个测验添加提交统计
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const submissionCount = await Submission.countDocuments({ quizId: quiz._id });
        return {
          _id: quiz._id,
          title: quiz.title,
          createdAt: quiz.createdAt,
          isActive: quiz.isActive,
          submissionCount
        };
      })
    );

    res.json({
      success: true,
      data: quizzesWithStats
    });
  } catch (error) {
    console.error('Error fetching quiz list:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch quiz list',
        code: 'QUIZ_LIST_ERROR'
      }
    });
  }
};

// 批量获取题目的AI分析结果
export const getQuestionAnalyses = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    
    console.log('📚 获取测验的所有AI分析结果, quizId:', quizId);
    
    // 使用优化的批量查询
    const { getBatchQuestionAnalyses } = await import('../utils/queryOptimization');
    
    // 先获取测验的所有问题ID
    const quiz = await QuizSession.findById(quizId).select('questions').lean();
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Quiz not found',
          code: 'QUIZ_NOT_FOUND'
        }
      });
    }
    
    const questionIds = quiz.questions.map((id: any) => id.toString());
    const analysisMap = await getBatchQuestionAnalyses(questionIds);
    
    console.log(`✅ 找到 ${analysisMap.size} 条分析结果`);
    
    // 转换为对象格式
    const analysisObject: { [key: string]: string } = {};
    analysisMap.forEach((value, key) => {
      analysisObject[key] = value;
    });
    
    res.json({
      success: true,
      data: analysisObject
    });
  } catch (error: any) {
    console.error('❌ 获取分析结果时出错:', error.message);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to get question analyses',
        code: 'GET_ANALYSES_ERROR'
      }
    });
  }
};

// AI分析题目
export const analyzeQuestion = async (req: Request, res: Response) => {
  try {
    console.log('📝 收到AI分析请求');
    const { questionId } = req.params;
    const { quizId } = req.body;

    console.log('题目ID:', questionId);
    console.log('测验ID:', quizId);

    // 检查环境变量
    console.log('环境变量检查:');
    console.log('- DOUBAO_API_URL:', process.env.DOUBAO_API_URL ? '已配置' : '未配置');
    console.log('- DOUBAO_API_KEY:', process.env.DOUBAO_API_KEY ? '已配置' : '未配置');
    console.log('- DOUBAO_MODEL:', process.env.DOUBAO_MODEL ? '已配置' : '未配置');

    // 获取题目信息
    const question = await Question.findById(questionId);
    if (!question) {
      console.log('❌ 题目未找到');
      return res.status(404).json({
        success: false,
        error: {
          message: 'Question not found',
          code: 'QUESTION_NOT_FOUND'
        }
      });
    }

    console.log('✅ 题目找到:', question.title);

    // 获取该题目的统计数据
    const submissions = await Submission.find({ quizId });
    const questionAnswers = submissions.flatMap(s => 
      s.answers.filter(a => a.questionId.toString() === questionId)
    );

    const totalAttempts = questionAnswers.length;
    const correctAttempts = questionAnswers.filter(a => a.isCorrect).length;
    const correctRate = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    console.log('📊 统计数据:', { totalAttempts, correctAttempts, correctRate });

    // 准备AI分析请求数据
    const analysisRequest = {
      title: question.title,
      content: question.content,
      options: question.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.id === question.correctAnswer
      })),
      difficulty: question.difficulty,
      correctRate,
      totalAttempts
    };

    // 先检查数据库中是否已有分析结果
    let existingAnalysis = await QuestionAnalysis.findOne({ questionId, quizId });
    
    if (existingAnalysis) {
      console.log('✅ 从数据库获取已有的分析结果');
      return res.json({
        success: true,
        data: {
          questionId,
          analysis: existingAnalysis.analysis,
          cached: true
        }
      });
    }

    console.log('🤖 开始调用AI分析...');

    // 调用AI分析
    const analysis = await analyzeQuestionWithAI(analysisRequest);

    console.log('✅ AI分析完成');

    // 保存分析结果到数据库
    try {
      await QuestionAnalysis.create({
        questionId,
        quizId,
        analysis
      });
      console.log('💾 分析结果已保存到数据库');
    } catch (saveError: any) {
      // 如果保存失败（比如重复），不影响返回结果
      console.warn('⚠️ 保存分析结果失败:', saveError.message);
    }

    res.json({
      success: true,
      data: {
        questionId,
        analysis,
        cached: false
      }
    });
  } catch (error: any) {
    console.error('❌ 分析题目时出错:', error.message);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to analyze question',
        code: 'QUESTION_ANALYSIS_ERROR'
      }
    });
  }
};
