import React, { useState, useEffect } from 'react';
import { analyticsService, QuizListItem } from '../../services/analyticsService';
import { ResponsiveLayout } from '../../components/common/ResponsiveLayout';
import OverallStats from '../../components/teacher/analytics/OverallStats';
import QuestionStats from '../../components/teacher/analytics/QuestionStats';
import StudentPerformance from '../../components/teacher/analytics/StudentPerformance';

const Analytics: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overall' | 'questions' | 'students'>('overall');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
    
    // 当页面获得焦点时刷新数据（例如从其他页面返回）
    const handleFocus = () => {
      loadQuizzes();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getQuizList();
      setQuizzes(data);
      if (data.length > 0) {
        setSelectedQuizId(data[0]._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '加载测验列表失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout role="teacher" showSidebar={true}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout role="teacher" showSidebar={true}>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </ResponsiveLayout>
    );
  }

  if (quizzes.length === 0) {
    return (
      <ResponsiveLayout role="teacher" showSidebar={true}>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">暂无测验数据</p>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout role="teacher" showSidebar={true}>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">统计分析</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">查看测验统计数据和学生表现分析</p>
      </div>

      {/* 测验选择器 */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="quiz-select" className="block text-sm font-medium text-gray-700">
            选择测验
          </label>
          <button
            onClick={loadQuizzes}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            title="刷新测验列表"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新
          </button>
        </div>
        <select
          id="quiz-select"
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
        >
          {quizzes.map((quiz) => (
            <option key={quiz._id} value={quiz._id}>
              {quiz.title} ({quiz.submissionCount} 份提交)
            </option>
          ))}
        </select>
      </div>

      {/* 标签页 */}
      <div className="bg-white shadow rounded-lg mb-4 sm:mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overall')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'overall'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              整体统计
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              题目分析
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              学生表现
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'overall' && <OverallStats quizId={selectedQuizId} />}
          {activeTab === 'questions' && <QuestionStats quizId={selectedQuizId} />}
          {activeTab === 'students' && <StudentPerformance quizId={selectedQuizId} />}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default Analytics;
