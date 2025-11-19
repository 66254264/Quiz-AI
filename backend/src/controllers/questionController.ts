import { Request, Response } from 'express';
import { Question } from '../models/Question';
import { ApiResponse } from '../types';

/**
 * Create a new question
 * @route POST /api/questions
 * @access Private (Teacher only)
 */
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { title, content, options, correctAnswer, explanation, difficulty, tags } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    // Create question
    const question = new Question({
      title,
      content,
      options,
      correctAnswer,
      explanation,
      difficulty: difficulty || 'medium',
      tags: tags || [],
      createdBy: userId
    });

    await question.save();

    const response: ApiResponse = {
      success: true,
      data: {
        question: {
          id: question._id,
          title: question.title,
          content: question.content,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          tags: question.tags,
          createdBy: question.createdBy,
          createdAt: question.createdAt,
          updatedAt: question.updatedAt
        }
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Failed to create question',
        code: 'CREATE_QUESTION_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Get all questions with optional filters
 * @route GET /api/questions
 * @access Private (Teacher only)
 */
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { difficulty, tags, search, page = '1', limit = '10' } = req.query;

    console.log('👤 当前登录用户ID:', userId);
    console.log('📥 请求参数:', req.query);

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    // Build query
    const query: any = { createdBy: userId };
    console.log('🔒 查询条件 (只显示当前用户创建的题目):', JSON.stringify(query));

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = typeof tags === 'string' ? tags.split(',') : tags;
      query.tags = { $in: tagArray };
    }

    if (search) {
      console.log('🔍 搜索关键词:', search);
      // Use regex for more flexible search (works without text index)
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ];
      console.log('🔍 搜索查询条件:', JSON.stringify(query));
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    console.log('📊 最终查询条件:', JSON.stringify(query));
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Question.countDocuments(query);
    console.log(`✅ 找到 ${questions.length} 条题目，总计 ${total} 条`);
    
    // 打印每个题目的创建者ID
    if (questions.length > 0) {
      console.log('📋 题目列表:');
      questions.forEach((q: any, index: number) => {
        console.log(`  ${index + 1}. ${q.title} (创建者: ${q.createdBy})`);
      });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        questions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Failed to fetch questions',
        code: 'GET_QUESTIONS_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Get a single question by ID
 * @route GET /api/questions/:id
 * @access Private (Teacher only)
 */
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    const question = await Question.findOne({
      _id: id,
      createdBy: userId
    });

    if (!question) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Question not found',
          code: 'QUESTION_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: { question }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Failed to fetch question',
        code: 'GET_QUESTION_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Update a question
 * @route PUT /api/questions/:id
 * @access Private (Teacher only)
 */
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const { title, content, options, correctAnswer, explanation, difficulty, tags } = req.body;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    // Find question and verify ownership
    const question = await Question.findOne({
      _id: id,
      createdBy: userId
    });

    if (!question) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Question not found or you do not have permission to update it',
          code: 'QUESTION_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Update fields
    if (title !== undefined) question.title = title;
    if (content !== undefined) question.content = content;
    if (options !== undefined) question.options = options;
    if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
    if (explanation !== undefined) question.explanation = explanation;
    if (difficulty !== undefined) question.difficulty = difficulty;
    if (tags !== undefined) question.tags = tags;

    await question.save();

    const response: ApiResponse = {
      success: true,
      data: {
        question: {
          id: question._id,
          title: question.title,
          content: question.content,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          tags: question.tags,
          createdBy: question.createdBy,
          createdAt: question.createdAt,
          updatedAt: question.updatedAt
        }
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Failed to update question',
        code: 'UPDATE_QUESTION_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Delete a question
 * @route DELETE /api/questions/:id
 * @access Private (Teacher only)
 */
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    // Find and delete question
    const question = await Question.findOneAndDelete({
      _id: id,
      createdBy: userId
    });

    if (!question) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Question not found or you do not have permission to delete it',
          code: 'QUESTION_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Question deleted successfully',
        questionId: id
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Failed to delete question',
        code: 'DELETE_QUESTION_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};
