import { useState, useEffect } from 'react';
import { teacherQuizService, TeacherQuiz } from '../../services/quizService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Pagination } from '../common/Pagination';

interface QuizListProps {
  onEdit: (quiz: TeacherQuiz) => void;
  onDelete: (quizId: string) => void;
  refreshTrigger?: number;
}

export const QuizList = ({ onEdit, onDelete, refreshTrigger }: QuizListProps) => {
  const [quizzes, setQuizzes] = useState<TeacherQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchQuizzes();
  }, [pagination.page, refreshTrigger]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await teacherQuizService.getTeacherQuizzes({
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success && response.data) {
        setQuizzes(response.data.quizzes);
        // 更新分页信息
        const paginationData = response.data.pagination;
        if (paginationData) {
          setPagination(prev => ({
            ...prev,
            total: paginationData.total,
            pages: paginationData.totalPages
          }));
        }
      } else {
        setError(response.error?.message || '获取测验列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleToggleActive = async (quiz: TeacherQuiz) => {
    setTogglingId(quiz._id);

    try {
      const response = await teacherQuizService.toggleQuizActive(quiz._id);

      if (response.success) {
        // Update local state
        setQuizzes(quizzes.map(q =>
          q._id === quiz._id ? { ...q, isActive: !q.isActive } : q
        ));
      } else {
        setError(response.error?.message || '切换状态失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-lg font-medium mb-2">暂无测验</p>
        <p className="text-sm">点击"创建测验"开始添加</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {quizzes.map((quiz) => (
        <div
          key={quiz._id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Quiz Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {quiz.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quiz.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {quiz.isActive ? '已发布' : '草稿'}
                </span>
              </div>

              {quiz.description && (
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {quiz.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {quiz.questionCount} 道题目
                </span>

                {quiz.timeLimit && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {quiz.timeLimit} 分钟
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  {quiz.submissionCount} 人已答
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-2">
              <button
                onClick={() => handleToggleActive(quiz)}
                disabled={togglingId === quiz._id}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  quiz.isActive
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                } disabled:opacity-50`}
              >
                {togglingId === quiz._id ? '处理中...' : quiz.isActive ? '取消发布' : '发布'}
              </button>

              <button
                onClick={() => onEdit(quiz)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                编辑
              </button>

              <button
                onClick={() => onDelete(quiz._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
        ))}
      </div>

      {/* 分页组件 */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
};
