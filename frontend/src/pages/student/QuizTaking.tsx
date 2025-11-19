import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ResponsiveLayout } from '../../components/common/ResponsiveLayout';
import { quizService, QuizWithQuestions } from '../../services/quizService';
import { QuestionDisplay } from '../../components/student/QuestionDisplay';
import { QuizProgress } from '../../components/student/QuizProgress';

export const QuizTaking: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<{ title: string; description?: string; timeLimit?: number; questionCount: number; questions: any[] } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [startTime] = useState(new Date());

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await quizService.startQuiz(quizId);

      if (response.success && response.data) {
        setQuiz({
          ...response.data.quiz,
          questions: response.data.questions
        });
      } else {
        setError(response.error?.message || '加载测验失败');
      }
    } catch (err) {
      setError('加载测验时发生错误');
      console.error('Error loading quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answerId,
    });
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionNavigate = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitClick = () => {
    const unansweredCount = quiz!.questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      setShowSubmitConfirm(true);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !quizId) return;

    try {
      setSubmitting(true);
      setError(null);

      // Prepare answers in the format expected by the API
      const submissionData = {
        answers: quiz.questions.map((question, index) => ({
          questionId: question._id,
          selectedAnswer: answers[index] || '',
        })),
        startTime
      };

      const response = await quizService.submitQuiz(quizId, submissionData);

      if (response.success) {
        // Navigate to results page
        navigate(`/student/quiz/${quizId}/result`);
      } else {
        setError(response.error?.message || '提交答案失败');
        setSubmitting(false);
      }
    } catch (err) {
      setError('提交答案时发生错误');
      setSubmitting(false);
      console.error('Error submitting quiz:', err);
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout role="student" showSidebar={false}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载测验中...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error || !quiz) {
    return (
      <ResponsiveLayout role="student" showSidebar={false}>
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 max-w-md">
            <div className="text-red-600 text-center mb-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg sm:text-xl font-semibold mb-2">加载失败</h2>
              <p className="text-sm sm:text-base text-gray-600">{error || '无法加载测验'}</p>
            </div>
            <button
              onClick={() => navigate('/student/quizzes')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              返回测验列表
            </button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <ResponsiveLayout role="student" showSidebar={false}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-sm sm:text-base text-gray-600 mt-1">{quiz.description}</p>
            )}
          </div>
          {quiz.timeLimit && (
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600">时间限制</p>
              <p className="text-base sm:text-lg font-semibold text-gray-800">{quiz.timeLimit} 分钟</p>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Question display */}
        <div className="lg:col-span-2">
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
            selectedAnswer={answers[currentQuestionIndex] || null}
            onAnswerSelect={handleAnswerSelect}
          />

          {/* Navigation buttons */}
          <div className="mt-4 sm:mt-6 flex justify-between items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 sm:px-6 py-2 border border-gray-300 rounded-md text-sm sm:text-base text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一题
            </button>

            <div className="flex gap-2 sm:gap-3">
              {!isLastQuestion ? (
                <button
                  onClick={handleNext}
                  className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  下一题
                </button>
              ) : (
                <button
                  onClick={handleSubmitClick}
                  disabled={submitting}
                  className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  {submitting ? '提交中...' : '提交答案'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress sidebar */}
        <div className="lg:col-span-1">
          <QuizProgress
            currentQuestion={currentQuestionIndex}
            totalQuestions={quiz.questions.length}
            answeredQuestions={answeredCount}
            onQuestionNavigate={handleQuestionNavigate}
            answers={answers}
          />
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">确认提交</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              您还有 {quiz.questions.length - answeredCount} 道题未作答，确定要提交吗？
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-colors"
              >
                继续答题
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleSubmit();
                }}
                disabled={submitting}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveLayout>
  );
};
