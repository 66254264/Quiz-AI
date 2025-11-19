import { apiCall } from '../utils/api';
import { CacheTTL } from '../utils/cache';
import type { Question, ApiResponse } from '../types';

export interface CreateQuestionData {
  title: string;
  content: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface UpdateQuestionData extends Partial<CreateQuestionData> {}

export interface QuestionFilters {
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const questionService = {
  // Create a new question
  createQuestion: async (data: CreateQuestionData): Promise<ApiResponse<{ question: Question }>> => {
    return apiCall<{ question: Question }>('POST', '/questions', data);
  },

  // Get all questions with filters
  getQuestions: async (filters?: QuestionFilters): Promise<ApiResponse<QuestionsResponse>> => {
    const params = new URLSearchParams();
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.tags) params.append('tags', filters.tags);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/questions?${queryString}` : '/questions';
    
    // Cache question list for 5 minutes
    return apiCall<QuestionsResponse>('GET', url, undefined, {
      cache: true,
      cacheTTL: CacheTTL.MEDIUM,
    });
  },

  // Get a single question by ID
  getQuestionById: async (id: string): Promise<ApiResponse<{ question: Question }>> => {
    // Cache individual questions for 15 minutes
    return apiCall<{ question: Question }>('GET', `/questions/${id}`, undefined, {
      cache: true,
      cacheTTL: CacheTTL.LONG,
    });
  },

  // Update a question
  updateQuestion: async (id: string, data: UpdateQuestionData): Promise<ApiResponse<{ question: Question }>> => {
    return apiCall<{ question: Question }>('PUT', `/questions/${id}`, data);
  },

  // Delete a question
  deleteQuestion: async (id: string): Promise<ApiResponse<{ message: string; questionId: string }>> => {
    return apiCall<{ message: string; questionId: string }>('DELETE', `/questions/${id}`);
  },
};
