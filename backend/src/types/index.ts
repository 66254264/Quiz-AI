import { Document } from 'mongoose';

// User types
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Question types
export interface IQuestion extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

// Quiz Session types
export interface IQuizSession extends Document {
  _id: string;
  title: string;
  description?: string;
  questions: string[];
  timeLimit?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Submission types
export interface ISubmission extends Document {
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
  startTime: Date;
  submitTime: Date;
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

export interface JwtPayload {
  userId: string;
  role: 'teacher' | 'student';
  iat?: number;
  exp?: number;
}