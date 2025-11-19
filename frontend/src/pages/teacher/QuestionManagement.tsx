import { useState } from 'react';
import { Question } from '../../types';
import { QuestionList } from '../../components/teacher/QuestionList';
import { QuestionForm } from '../../components/teacher/QuestionForm';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ResponsiveLayout } from '../../components/common/ResponsiveLayout';
import { questionService } from '../../services/questionService';
import { useToast } from '../../contexts/ToastContext';

export const QuestionManagement = () => {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };

  const handleDeleteClick = (questionId: string) => {
    setDeletingQuestionId(questionId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingQuestionId) return;

    setDeleteLoading(true);

    try {
      const response = await questionService.deleteQuestion(deletingQuestionId);

      if (response.success) {
        toast.success('题目删除成功');
        setDeletingQuestionId(null);
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
    setDeletingQuestionId(null);
  };

  return (
    <ResponsiveLayout role="teacher" showSidebar={true}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">题目管理</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">创建和管理您的题目库</p>
      </div>

      {/* Main Content */}
      {showForm ? (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            {editingQuestion ? '编辑题目' : '创建新题目'}
          </h2>
          <div className="min-h-[400px]">
            <QuestionForm
              question={editingQuestion}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={handleCreateNew}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              + 创建题目
            </button>
          </div>

          {/* Question List */}
          <QuestionList
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            refreshTrigger={refreshTrigger}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingQuestionId}
        title="确认删除"
        message="确定要删除这道题目吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </ResponsiveLayout>
  );
};
