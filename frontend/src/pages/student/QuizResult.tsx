import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ResponsiveLayout } from '../../components/common/ResponsiveLayout';
import { quizService, QuizResultResponse } from '../../services/quizService';
import { ResultSummary } from '../../components/student/ResultSummary';
import { AnswerReview } from '../../components/student/AnswerReview';
import { invalidateCache } from '../../utils/api';

export const QuizResult: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<QuizResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (quizId) {
      loadResult();
    }
  }, [quizId]);

  const loadResult = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await quizService.getQuizResult(quizId);

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error?.message || '加载结果失败');
      }
    } catch (err) {
      setError('加载结果时发生错误');
      console.error('Error loading result:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    // Clear quiz list cache so it refreshes when navigating back
    console.log('🧹 Clearing quiz cache before navigation');
    invalidateCache(/\/quizzes/);
    // Navigate with replace to ensure fresh load
    navigate('/student/quizzes', { replace: false, state: { refresh: Date.now() } });
  };

  if (loading) {
    return (
      <ResponsiveLayout role="student" showSidebar={false}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载结果中...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error || !result) {
    return (
      <ResponsiveLayout role="student" showSidebar={false}>
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 max-w-md">
            <div className="text-red-600 text-center mb-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg sm:text-xl font-semibold mb-2">加载失败</h2>
              <p className="text-sm sm:text-base text-gray-600">{error || '无法加载结果'}</p>
            </div>
            <button
              onClick={handleBackToList}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              返回测验列表
            </button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout role="student" showSidebar={false}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{result.submission.quiz.title}</h1>
          {result.submission.quiz.description && (
            <p className="text-sm sm:text-base text-gray-600 mt-2">{result.submission.quiz.description}</p>
          )}
        </div>

        {/* Result summary */}
        <div className="mb-4 sm:mb-6">
          <ResultSummary submission={{
            ...result.submission,
            score: result.submission.score,
            totalQuestions: result.submission.totalQuestions,
            timeSpent: result.submission.timeSpent
          } as any} />
        </div>

        {/* Action buttons */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 bg-blue-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              {showDetails ? '隐藏答题详情' : '查看答题详情'}
            </button>
            <button
              onClick={handleBackToList}
              className="flex-1 bg-gray-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-md hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base"
            >
              返回测验列表
            </button>
          </div>
        </div>

        {/* Answer review */}
        {showDetails && (
          <div className="mb-4 sm:mb-6">
            <AnswerReview
              answers={result.answers}
            />
          </div>
        )}

        {/* Bottom navigation */}
        {showDetails && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky bottom-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
            >
              返回顶部
            </button>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};
