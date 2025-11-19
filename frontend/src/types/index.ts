// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'teacher' | 'student';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Question types
export interface Question {
  _id: string;
  title: string;
  content: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Quiz types
export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  questions: string[];
  timeLimit?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Submission types
export interface Submission {
  _id: string;
  quizId: string;
  studentId: string;
  answers: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
  score: number;
  totalQuestions: number;
  startTime: string;
  submitTime: string;
  timeSpent: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
  profile: {
    firstName: string;
    lastName: string;
  };
}