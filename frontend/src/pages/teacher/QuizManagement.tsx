import { useState } from 'react';
import { ResponsiveLayout } from '../../components/common/ResponsiveLayout';
import { QuizList } from '../../components/teacher/QuizList';
import { QuizForm } from '../../components/teacher/QuizForm';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { teacherQuizService, TeacherQuiz } from '../../services/quizService';
import { useToast } from '../../contexts/ToastContext';

export const QuizManagement = () => {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<TeacherQuiz | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setEditingQuiz(null);
    setShowForm(true);
  };

  const handleEdit = (quiz: TeacherQuiz) => {
    setEditingQuiz(quiz);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingQuiz(null);
    setRefreshTrigger(prev => prev + 1);
    toast.success(editingQuiz ? '测验更新成功' : '测验创建成功');
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingQuiz(null);
  };

  const handleDeleteClick = (quizId: string) => {
    setDeletingQuizId(quizId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingQuizId) return;

    setDeleteLoading(true);

    try {
      const response = await teacherQuizService.deleteQuiz(deletingQuizId);

      if (response.success) {
        toast.success('测验删除成功');
        setDeletingQuizId(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(response.error?.message || '删除失败');
      }
    } catch (err) {
      toast.error('网络错误，请稍后重试');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingQuizId(null);
  };

  return (
    <ResponsiveLayout role="teacher" showSidebar={true}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">测验管理</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">创建和管理测验，发布给学生</p>
      </div>

      {/* Main Content */}
      {showForm ? (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            {editingQuiz ? '编辑测验' : '创建新测验'}
          </h2>
          <QuizForm
            quiz={editingQuiz}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={handleCreateNew}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              + 创建测验
            </button>
          </div>

          {/* Quiz List */}
          <QuizList
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            refreshTrigger={refreshTrigger}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingQuizId}
        title="确认删除"
        message="确定要删除这个测验吗？此操作无法撤销，将同时删除所有相关的提交记录和分析数据。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </ResponsiveLayout>
  );
};
