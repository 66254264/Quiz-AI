import { apiCall } from '../utils/api';
import type { Quiz, Question, ApiResponse } from '../types';

export interface QuizWithQuestions extends Quiz {
  questionDetails: Question[];
}

export interface StartQuizResponse {
  quiz: {
    _id: string;
    title: string;
    description?: string;
    timeLimit?: number;
    questionCount: number;
  };
  questions: Question[];
  startTime: Date;
}

export interface SubmitQuizData {
  answers: {
    questionId: string;
    selectedAnswer: string;
  }[];
}

export interface QuizResultResponse {
  submission: {
    _id: string;
    quiz: {
      _id: string;
      title: string;
      description?: string;
    };
    score: number;
    totalQuestions: number;
    percentage: number;
    timeSpent: number;
    submitTime: string;
  };
  answers: {
    questionId: string;
    question: {
      title: string;
      content: string;
      options: { id: string; text: string }[];
      explanation?: string;
    } | null;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

export interface SubmitQuizResponse {
  submissionId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
}

export const quizService = {
  // Get all available quizzes for students
  getAvailableQuizzes: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<{ 
    quizzes: Quiz[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/quizzes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    // Don't cache quiz list as it changes when students complete quizzes
    return apiCall('GET', url, undefined, { cache: false });
  },

  // Start a quiz session
  startQuiz: async (quizId: string): Promise<ApiResponse<StartQuizResponse>> => {
    return apiCall<StartQuizResponse>('POST', `/quizzes/${quizId}/start`);
  },

  // Submit quiz answers
  submitQuiz: async (quizId: string, data: SubmitQuizData & { startTime: Date }): Promise<ApiResponse<SubmitQuizResponse>> => {
    return apiCall<SubmitQuizResponse>('POST', `/quizzes/${quizId}/submit`, data);
  },

  // Get quiz result
  getQuizResult: async (quizId: string): Promise<ApiResponse<QuizResultResponse>> => {
    return apiCall<QuizResultResponse>('GET', `/quizzes/${quizId}/result`);
  },
};

// Teacher Quiz Management Services

export interface CreateQuizData {
  title: string;
  description?: string;
  questions: string[]; // Array of question IDs
  timeLimit?: number;
}

export interface TeacherQuiz extends Quiz {
  submissionCount: number;
  questionCount: number;
}

export const teacherQuizService = {
  // Create a new quiz
  createQuiz: async (data: CreateQuizData): Promise<ApiResponse<{ quiz: Quiz }>> => {
    return apiCall<{ quiz: Quiz }>('POST', '/quizzes/teacher', data);
  },

  // Get all quizzes created by the teacher
  getTeacherQuizzes: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<{ 
    quizzes: TeacherQuiz[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/quizzes/teacher${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall('GET', url);
  },

  // Get a single quiz by ID
  getTeacherQuizById: async (id: string): Promise<ApiResponse<{ quiz: Quiz }>> => {
    return apiCall<{ quiz: Quiz }>('GET', `/quizzes/teacher/${id}`);
  },

  // Update a quiz
  updateQuiz: async (id: string, data: Partial<CreateQuizData>): Promise<ApiResponse<{ quiz: Quiz }>> => {
    return apiCall<{ quiz: Quiz }>('PUT', `/quizzes/teacher/${id}`, data);
  },

  // Delete a quiz
  deleteQuiz: async (id: string): Promise<ApiResponse<{ message: string; quizId: string }>> => {
    return apiCall<{ message: string; quizId: string }>('DELETE', `/quizzes/teacher/${id}`);
  },

  // Toggle quiz active status
  toggleQuizActive: async (id: string): Promise<ApiResponse<{ quiz: Quiz; message: string }>> => {
    return apiCall<{ quiz: Quiz; message: string }>('PATCH', `/quizzes/teacher/${id}/toggle-active`);
  },
};
