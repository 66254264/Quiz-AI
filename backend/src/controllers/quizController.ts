import { Request, Response } from 'express';
import { QuizSession } from '../models/QuizSession';
import { Question } from '../models/Question';
import { Submission } from '../models/Submission';
import { QuestionAnalysis } from '../models/QuestionAnalysis';
import { ApiResponse } from '../types';

/**
 * Get all available quizzes for students
 * @route GET /api/quizzes
 * @access Private (Student only)
 */
export const getAvailableQuizzes = async (req: Request, res: Response) => {
  try {
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

    // Get all active quizzes
    const quizzes = await QuizSession.find({ isActive: true })
      .populate('createdBy', 'username profile')
      .sort({ createdAt: -1 })
      .lean();

    // Check which quizzes the student has already completed
    const submissions = await Submission.find({ studentId: userId }).select('quizId').lean();
    const completedQuizIds = new Set(submissions.map(s => s.quizId.toString()));

    // Filter out completed quizzes and add status
    const quizzesWithStatus = quizzes
      .filter(quiz => !completedQuizIds.has(quiz._id.toString()))
      .map(quiz => ({
        ...quiz,
        isCompleted: false,
        questionCount: quiz.questions ? quiz.questions.length : 0
      }));

    const response: ApiResponse = {
      success: true,
      data: { quizzes: quizzesWithStatus }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Failed to fetch quizzes',
        code: 'GET_QUIZZES_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Start a quiz session (get quiz questions without correct answers)
 * @route POST /api/quizzes/:id/start
 * @access Private (Student only)
 */
export const startQuiz = async (req: Request, res: Response) => {
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

    // Check if quiz exists and is active
    const quiz = await QuizSession.findOne({ _id: id, isActive: true });

    if (!quiz) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '测验未找到或未发布',
          code: 'QUIZ_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Check if student has already submitted this quiz
    const existingSubmission = await Submission.findOne({
      quizId: id,
      studentId: userId
    });

    if (existingSubmission) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '您已经完成过这个测验',
          code: 'QUIZ_ALREADY_COMPLETED'
        }
      };
      return res.status(400).json(response);
    }

    // Get questions without correct answers and explanations
    const questions = await Question.find({
      _id: { $in: quiz.questions }
    })
      .select('-correctAnswer -explanation')
      .lean();

    const response: ApiResponse = {
      success: true,
      data: {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          questionCount: questions.length
        },
        questions,
        startTime: new Date()
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Failed to start quiz',
        code: 'START_QUIZ_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Submit quiz answers and calculate results
 * @route POST /api/quizzes/:id/submit
 * @access Private (Student only)
 */
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answers, startTime } = req.body;
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

    // Check if quiz exists
    const quiz = await QuizSession.findById(id);

    if (!quiz) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '测验未找到',
          code: 'QUIZ_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Check if student has already submitted this quiz
    const existingSubmission = await Submission.findOne({
      quizId: id,
      studentId: userId
    });

    if (existingSubmission) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '您已经提交过这个测验',
          code: 'QUIZ_ALREADY_SUBMITTED'
        }
      };
      return res.status(400).json(response);
    }

    // Get all questions with correct answers
    const questions = await Question.find({
      _id: { $in: quiz.questions }
    });

    // Create a map of question ID to correct answer
    const correctAnswersMap = new Map(
      questions.map(q => [q._id.toString(), q.correctAnswer])
    );

    // Calculate results
    const processedAnswers = answers.map((answer: any) => {
      const correctAnswer = correctAnswersMap.get(answer.questionId);
      const isCorrect = answer.selectedAnswer === correctAnswer;
      console.log(`📝 Processing answer for question ${answer.questionId}:`, {
        selectedAnswer: answer.selectedAnswer,
        correctAnswer,
        isCorrect
      });
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    });

    const score = processedAnswers.filter((a: any) => a.isCorrect).length;
    const submitTime = new Date();
    const startTimeDate = new Date(startTime);

    console.log(`✅ Quiz submission summary:`, {
      quizId: id,
      studentId: userId,
      totalQuestions: questions.length,
      answersCount: processedAnswers.length,
      score,
      percentage: Math.round((score / questions.length) * 100)
    });

    // Create submission
    const submission = new Submission({
      quizId: id,
      studentId: userId,
      answers: processedAnswers,
      score,
      totalQuestions: questions.length,
      startTime: startTimeDate,
      submitTime
    });

    await submission.save();
    console.log(`💾 Submission saved with ID: ${submission._id}`);

    const response: ApiResponse = {
      success: true,
      data: {
        submissionId: submission._id,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        percentage: Math.round((score / questions.length) * 100),
        timeSpent: submission.timeSpent
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Failed to submit quiz',
        code: 'SUBMIT_QUIZ_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Get quiz result details
 * @route GET /api/quizzes/:id/result
 * @access Private (Student only)
 */
export const getQuizResult = async (req: Request, res: Response) => {
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

    // Find submission
    const submission = await Submission.findOne({
      quizId: id,
      studentId: userId
    }).populate('quizId', 'title description');

    if (!submission) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '提交记录未找到',
          code: 'SUBMISSION_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Get questions with correct answers and explanations
    const questionIds = submission.answers.map(a => a.questionId);
    const questions = await Question.find({
      _id: { $in: questionIds }
    }).lean();

    // Create a map of question details
    const questionsMap = new Map(
      questions.map(q => [q._id.toString(), q])
    );

    // Combine submission answers with question details
    const detailedAnswers = submission.answers.map(answer => {
      const question = questionsMap.get(answer.questionId.toString());
      return {
        questionId: answer.questionId,
        question: question ? {
          title: question.title,
          content: question.content,
          options: question.options,
          explanation: question.explanation
        } : null,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question?.correctAnswer,
        isCorrect: answer.isCorrect
      };
    });

    const response: ApiResponse = {
      success: true,
      data: {
        submission: {
          _id: submission._id,
          quiz: submission.quizId,
          score: submission.score,
          totalQuestions: submission.totalQuestions,
          percentage: Math.round((submission.score / submission.totalQuestions) * 100),
          timeSpent: submission.timeSpent,
          submitTime: submission.submitTime
        },
        answers: detailedAnswers
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || 'Failed to fetch quiz result',
        code: 'GET_RESULT_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Create a new quiz (Teacher only)
 * @route POST /api/quizzes/teacher
 * @access Private (Teacher only)
 */
export const createQuiz = async (req: Request, res: Response) => {
  try {
    console.log('📝 [createQuiz] 收到创建测验请求');
    const { title, description, questions, timeLimit } = req.body;
    const userId = req.user?.userId;
    console.log('📝 [createQuiz] 用户ID:', userId);
    console.log('📝 [createQuiz] 测验标题:', title);
    console.log('📝 [createQuiz] 题目数量:', questions?.length);

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '用户未认证',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    // Create quiz
    const quiz = new QuizSession({
      title,
      description,
      questions,
      timeLimit,
      isActive: false, // Default to inactive (draft)
      createdBy: userId
    });

    console.log('📝 [createQuiz] 准备保存到数据库...');
    await quiz.save();
    console.log('✅ [createQuiz] 测验已保存成功!');
    console.log('✅ [createQuiz] 测验ID:', quiz._id);
    console.log('✅ [createQuiz] 集合名称:', quiz.collection.name);

    const response: ApiResponse = {
      success: true,
      data: { quiz }
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || '创建测验失败',
        code: 'CREATE_QUIZ_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Get all quizzes created by the teacher
 * @route GET /api/quizzes/teacher
 * @access Private (Teacher only)
 */
export const getTeacherQuizzes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { page, limit } = req.query;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '用户未认证',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    // 使用优化的分页查询
    const { paginateQuery } = await import('../utils/queryOptimization');
    const result = await paginateQuery(
      QuizSession,
      { createdBy: userId },
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        sort: 'createdAt',
        order: 'desc'
      }
    );

    // Get submission counts for each quiz (批量查询优化)
    const quizIds = result.data.map((q: any) => q._id);
    const submissionCounts = await Submission.aggregate([
      { $match: { quizId: { $in: quizIds.map(id => id.toString()) } } },
      { $group: { _id: '$quizId', count: { $sum: 1 } } }
    ]);

    const submissionMap = new Map(
      submissionCounts.map(item => [item._id.toString(), item.count])
    );

    const quizzesWithStats = result.data.map((quiz: any) => ({
      ...quiz,
      submissionCount: submissionMap.get(quiz._id.toString()) || 0,
      questionCount: quiz.questions?.length || 0
    }));

    const response: ApiResponse = {
      success: true,
      data: {
        quizzes: quizzesWithStats,
        pagination: result.pagination
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || '获取测验列表失败',
        code: 'GET_TEACHER_QUIZZES_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Get a single quiz by ID (Teacher only)
 * @route GET /api/quizzes/teacher/:id
 * @access Private (Teacher only)
 */
export const getTeacherQuizById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '用户未认证',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    const quiz = await QuizSession.findOne({
      _id: id,
      createdBy: userId
    }).populate('questions');

    if (!quiz) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '测验未找到',
          code: 'QUIZ_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: { quiz }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || '获取测验详情失败',
        code: 'GET_QUIZ_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Update a quiz (Teacher only)
 * @route PUT /api/quizzes/teacher/:id
 * @access Private (Teacher only)
 */
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, questions, timeLimit } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '用户未认证',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    const quiz = await QuizSession.findOne({
      _id: id,
      createdBy: userId
    });

    if (!quiz) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '测验未找到或无权限修改',
          code: 'QUIZ_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Update fields
    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (questions !== undefined) quiz.questions = questions;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;

    await quiz.save();

    const response: ApiResponse = {
      success: true,
      data: { quiz }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || '更新测验失败',
        code: 'UPDATE_QUIZ_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Delete a quiz (Teacher only)
 * @route DELETE /api/quizzes/teacher/:id
 * @access Private (Teacher only)
 */
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '用户未认证',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    // 先查找测验，确认存在且有权限
    const quiz = await QuizSession.findOne({
      _id: id,
      createdBy: userId
    });

    if (!quiz) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '测验未找到或无权限删除',
          code: 'QUIZ_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // 使用级联删除（中间件会自动删除关联数据）
    await QuizSession.findByIdAndDelete(id);
    console.log(`✅ 测验及其关联数据已自动删除: ${quiz.title}`);

    const response: ApiResponse = {
      success: true,
      data: {
        message: '测验及相关数据删除成功',
        quizId: id
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || '删除测验失败',
        code: 'DELETE_QUIZ_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};

/**
 * Toggle quiz active status (publish/unpublish)
 * @route PATCH /api/quizzes/teacher/:id/toggle-active
 * @access Private (Teacher only)
 */
export const toggleQuizActive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '用户未认证',
          code: 'NOT_AUTHENTICATED'
        }
      };
      return res.status(401).json(response);
    }

    const quiz = await QuizSession.findOne({
      _id: id,
      createdBy: userId
    });

    if (!quiz) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: '测验未找到或无权限修改',
          code: 'QUIZ_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    quiz.isActive = !quiz.isActive;
    await quiz.save();

    const response: ApiResponse = {
      success: true,
      data: {
        quiz,
        message: quiz.isActive ? '测验已发布' : '测验已取消发布'
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message || '切换测验状态失败',
        code: 'TOGGLE_QUIZ_ERROR',
        details: error
      }
    };
    res.status(500).json(response);
  }
};
