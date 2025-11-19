import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ResponsiveLayout } from '../../components/common/ResponsiveLayout';
import { quizService } from '../../services/quizService';
import { Quiz } from '../../types';
import { QuizCard } from '../../components/student/QuizCard';

export const QuizList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Always load fresh data when component mounts or location changes
    console.log('🔄 QuizList mounted or location changed');
    loadQuizzes();
  }, [location.key]); // Reload when navigation occurs

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📋 Loading available quizzes...');
      const response = await quizService.getAvailableQuizzes();

      if (response.success && response.data) {
        console.log('✅ Loaded quizzes:', response.data.quizzes.length);
        setQuizzes(response.data.quizzes);
      } else {
        console.error('❌ Failed to load quizzes:', response.error);
        setError(response.error?.message || '加载测验列表失败');
      }
    } catch (err) {
      console.error('❌ Error loading quizzes:', err);
      setError('加载测验列表时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId: string) => {
    navigate(`/student/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <ResponsiveLayout role="student" showSidebar={true}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载测验列表中...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout role="student" showSidebar={true}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">可用测验</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">选择一个测验开始答题</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 text-sm sm:text-base">{error}</span>
          </div>
          <button
            onClick={loadQuizzes}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
          >
            重试
          </button>
        </div>
      )}

      {/* Quiz list */}
      {!error && quizzes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">暂无可用测验</h3>
          <p className="text-sm sm:text-base text-gray-600">目前没有可以参加的测验，请稍后再试</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              onStart={handleStartQuiz}
            />
          ))}
        </div>
      )}
    </ResponsiveLayout>
  );
};
