import { api } from '../utils/api';

export interface OverallStatistics {
  totalSubmissions: number;
  totalStudents: number;
  averageScore: number;
  averagePercentage: number;
  averageTimeSpent: number;
  scoreDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}

export interface QuestionStatistics {
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  questionStats: {
    questionId: string;
    title: string;
    content: string;
    difficulty: 'easy' | 'medium' | 'hard';
    totalAttempts: number;
    correctAttempts: number;
    correctRate: number;
    optionStats: {
      optionId: string;
      optionText: string;
      selectedCount: number;
      percentage: number;
      isCorrect: boolean;
    }[];
  }[];
}

export interface StudentPerformance {
  totalStudents: number;
  students: {
    studentId: string;
    studentName: string;
    username: string;
    email: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    timeSpent: number;
    submitTime: Date;
    correctAnswers: number;
    incorrectAnswers: number;
    rank: number;
  }[];
}

export interface QuizListItem {
  _id: string;
  title: string;
  createdAt: Date;
  isActive: boolean;
  submissionCount: number;
}

export const analyticsService = {
  // 获取整体统计数据
  getOverallStatistics: async (params?: {
    quizId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OverallStatistics> => {
    const response = await api.get('/analytics/overall', { params });
    return response.data.data;
  },

  // 获取测验列表
  getQuizList: async (): Promise<QuizListItem[]> => {
    const response = await api.get('/analytics/quizzes');
    return response.data.data;
  },

  // 获取按题目统计数据
  getQuestionStatistics: async (
    quizId: string,
    params?: {
      sortBy?: 'difficulty' | 'correctRate' | 'attempts';
      order?: 'asc' | 'desc';
    }
  ): Promise<QuestionStatistics> => {
    const response = await api.get(`/analytics/questions/${quizId}`, { params });
    return response.data.data;
  },

  // 获取学生表现分析
  getStudentPerformance: async (
    quizId: string,
    params?: {
      sortBy?: 'score' | 'percentage' | 'timeSpent' | 'submitTime';
      order?: 'asc' | 'desc';
      minScore?: number;
      maxScore?: number;
    }
  ): Promise<StudentPerformance> => {
    const response = await api.get(`/analytics/students/${quizId}`, { params });
    return response.data.data;
  },

  // 批量获取题目的AI分析结果
  getQuestionAnalyses: async (quizId: string): Promise<{ [key: string]: string }> => {
    const response = await api.get(`/analytics/questions/${quizId}/analyses`);
    return response.data.data;
  },

  // AI分析题目
  analyzeQuestion: async (questionId: string, quizId: string): Promise<string> => {
    console.log('📤 发送AI分析请求:', { questionId, quizId });
    
    // 使用更长的超时时间（60秒）因为AI分析需要时间
    const response = await api.post(
      `/analytics/questions/${questionId}/analyze`, 
      { quizId },
      { timeout: 60000 }
    );
    
    console.log('📥 收到响应:', response);
    console.log('响应数据:', response.data);
    console.log('分析结果:', response.data.data);
    
    if (!response.data || !response.data.data || !response.data.data.analysis) {
      console.error('❌ 响应数据格式错误:', response.data);
      throw new Error('服务器返回的数据格式不正确');
    }
    
    return response.data.data.analysis;
  }
};
