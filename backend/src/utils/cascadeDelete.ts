/**
 * 级联删除工具函数
 * 用于在删除主记录时自动删除所有关联记录
 */

import { Question } from '../models/Question';
import { QuizSession } from '../models/QuizSession';
import { Submission } from '../models/Submission';
import { QuestionAnalysis } from '../models/QuestionAnalysis';
import { User } from '../models/User';
import mongoose from 'mongoose';

/**
 * 删除测验及其所有关联数据
 * @param quizId 测验ID
 */
export async function deleteQuizWithCascade(quizId: string): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(`🗑️  开始级联删除测验: ${quizId}`);

    // 1. 查找所有相关问题
    const questions = await Question.find({ 
      _id: { $in: (await QuizSession.findById(quizId).select('questions'))?.questions || [] }
    }).session(session);
    
    const questionIds = questions.map(q => q._id);
    console.log(`  - 找到 ${questionIds.length} 个问题`);

    // 2. 删除所有问题的 AI 分析
    const analysisResult = await QuestionAnalysis.deleteMany({ 
      questionId: { $in: questionIds } 
    }).session(session);
    console.log(`  - 删除了 ${analysisResult.deletedCount} 个 AI 分析记录`);

    // 3. 删除所有提交记录
    const submissionResult = await Submission.deleteMany({ 
      quizId 
    }).session(session);
    console.log(`  - 删除了 ${submissionResult.deletedCount} 个提交记录`);

    // 4. 删除测验本身
    await QuizSession.findByIdAndDelete(quizId).session(session);
    console.log(`  - 删除了测验`);

    // 注意：不删除问题，因为问题可能被其他测验使用
    // 如果需要删除问题，取消下面的注释
    // await Question.deleteMany({ _id: { $in: questionIds } }).session(session);

    await session.commitTransaction();
    console.log(`✅ 测验 ${quizId} 及其关联数据删除成功`);
  } catch (error) {
    await session.abortTransaction();
    console.error(`❌ 删除测验失败:`, error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * 删除问题及其所有关联数据
 * @param questionId 问题ID
 */
export async function deleteQuestionWithCascade(questionId: string): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(`🗑️  开始级联删除问题: ${questionId}`);

    // 1. 删除 AI 分析
    const analysisResult = await QuestionAnalysis.deleteMany({ 
      questionId 
    }).session(session);
    console.log(`  - 删除了 ${analysisResult.deletedCount} 个 AI 分析记录`);

    // 2. 从所有测验中移除该问题
    const quizResult = await QuizSession.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } }
    ).session(session);
    console.log(`  - 从 ${quizResult.modifiedCount} 个测验中移除了该问题`);

    // 3. 删除包含该问题的提交记录中的答案
    await Submission.updateMany(
      { 'answers.questionId': questionId },
      { $pull: { answers: { questionId } } }
    ).session(session);

    // 4. 删除问题本身
    await Question.findByIdAndDelete(questionId).session(session);
    console.log(`  - 删除了问题`);

    await session.commitTransaction();
    console.log(`✅ 问题 ${questionId} 及其关联数据删除成功`);
  } catch (error) {
    await session.abortTransaction();
    console.error(`❌ 删除问题失败:`, error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * 删除用户及其所有关联数据
 * @param userId 用户ID
 */
export async function deleteUserWithCascade(userId: string): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(`🗑️  开始级联删除用户: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.role === 'teacher') {
      // 删除老师创建的所有测验
      const quizzes = await QuizSession.find({ createdBy: userId }).session(session);
      console.log(`  - 找到 ${quizzes.length} 个测验`);

      for (const quiz of quizzes) {
        await deleteQuizWithCascade(quiz._id.toString());
      }

      // 删除老师创建的所有问题
      const questionResult = await Question.deleteMany({ 
        createdBy: userId 
      }).session(session);
      console.log(`  - 删除了 ${questionResult.deletedCount} 个问题`);
    } else if (user.role === 'student') {
      // 删除学生的所有提交记录
      const submissionResult = await Submission.deleteMany({ 
        studentId: userId 
      }).session(session);
      console.log(`  - 删除了 ${submissionResult.deletedCount} 个提交记录`);
    }

    // 删除用户本身
    await User.findByIdAndDelete(userId).session(session);
    console.log(`  - 删除了用户`);

    await session.commitTransaction();
    console.log(`✅ 用户 ${userId} 及其关联数据删除成功`);
  } catch (error) {
    await session.abortTransaction();
    console.error(`❌ 删除用户失败:`, error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * 删除提交记录（简单删除，无级联）
 * @param submissionId 提交ID
 */
export async function deleteSubmission(submissionId: string): Promise<void> {
  try {
    await Submission.findByIdAndDelete(submissionId);
    console.log(`✅ 提交记录 ${submissionId} 删除成功`);
  } catch (error) {
    console.error(`❌ 删除提交记录失败:`, error);
    throw error;
  }
}

/**
 * 清理孤立数据
 * 删除没有关联的数据
 */
export async function cleanOrphanedData(): Promise<void> {
  console.log('🧹 开始清理孤立数据...');

  try {
    // 1. 清理没有关联测验的提交记录
    const allSubmissions = await Submission.find();
    let orphanedSubmissions = 0;
    
    for (const submission of allSubmissions) {
      const quizExists = await QuizSession.exists({ _id: submission.quizId });
      if (!quizExists) {
        await Submission.findByIdAndDelete(submission._id);
        orphanedSubmissions++;
      }
    }
    console.log(`  - 清理了 ${orphanedSubmissions} 个孤立的提交记录`);

    // 2. 清理没有关联问题的 AI 分析
    const allAnalyses = await QuestionAnalysis.find();
    let orphanedAnalyses = 0;
    
    for (const analysis of allAnalyses) {
      const questionExists = await Question.exists({ _id: analysis.questionId });
      if (!questionExists) {
        await QuestionAnalysis.findByIdAndDelete(analysis._id);
        orphanedAnalyses++;
      }
    }
    console.log(`  - 清理了 ${orphanedAnalyses} 个孤立的 AI 分析记录`);

    // 3. 清理测验中不存在的问题引用
    const allQuizzes = await QuizSession.find();
    let cleanedQuizzes = 0;
    
    for (const quiz of allQuizzes) {
      const validQuestions = [];
      for (const questionId of quiz.questions) {
        const exists = await Question.exists({ _id: questionId });
        if (exists) {
          validQuestions.push(questionId);
        }
      }
      
      if (validQuestions.length !== quiz.questions.length) {
        quiz.questions = validQuestions as any;
        await quiz.save();
        cleanedQuizzes++;
      }
    }
    console.log(`  - 清理了 ${cleanedQuizzes} 个测验中的无效问题引用`);

    console.log('✅ 孤立数据清理完成');
  } catch (error) {
    console.error('❌ 清理孤立数据失败:', error);
    throw error;
  }
}
