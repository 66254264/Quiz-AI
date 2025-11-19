import { useState, useEffect } from 'react';
import { teacherQuizService, CreateQuizData, TeacherQuiz } from '../../services/quizService';
import { questionService } from '../../services/questionService';
import { Question } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface QuizFormProps {
  quiz?: TeacherQuiz | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const QuizForm = ({ quiz, onSuccess, onCancel }: QuizFormProps) => {
  const [formData, setFormData] = useState<CreateQuizData>({
    title: '',
    description: '',
    questions: [],
    timeLimit: undefined,
  });

  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        questions: quiz.questions.map((q: any) => typeof q === 'string' ? q : q._id),
        timeLimit: quiz.timeLimit,
      });
    }
  }, [quiz]);

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const response = await questionService.getQuestions();
      if (response.success && response.data) {
        setAvailableQuestions(response.data.questions);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '测验标题不能为空';
    }

    if (formData.questions.length === 0) {
      newErrors.questions = '至少需要选择一道题目';
    }

    if (formData.timeLimit && (formData.timeLimit < 1 || formData.timeLimit > 480)) {
      newErrors.timeLimit = '时间限制必须在1-480分钟之间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const response = quiz
        ? await teacherQuizService.updateQuiz(quiz._id, formData)
        : await teacherQuizService.createQuiz(formData);

      if (response.success) {
        onSuccess();
      } else {
        setSubmitError(response.error?.message || '操作失败');
      }
    } catch (err) {
      setSubmitError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.includes(questionId)
        ? prev.questions.filter(id => id !== questionId)
        : [...prev.questions, questionId]
    }));
  };

  const selectAll = () => {
    setFormData(prev => ({
      ...prev,
      questions: availableQuestions.map(q => q._id)
    }));
  };

  const deselectAll = () => {
    setFormData(prev => ({
      ...prev,
      questions: []
    }));
  };

  if (loadingQuestions) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" message="加载题目..." />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {submitError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          测验标题 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="输入测验标题"
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          测验描述
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入测验描述（可选）"
        />
      </div>

      {/* Time Limit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          时间限制（分钟）
        </label>
        <input
          type="number"
          value={formData.timeLimit || ''}
          onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value ? parseInt(e.target.value) : undefined })}
          min="1"
          max="480"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.timeLimit ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="不限制时间"
        />
        {errors.timeLimit && <p className="mt-1 text-sm text-red-500">{errors.timeLimit}</p>}
        <p className="mt-1 text-xs text-gray-500">留空表示不限制时间</p>
      </div>

      {/* Question Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            选择题目 <span className="text-red-500">*</span>
            <span className="ml-2 text-gray-500 font-normal">
              (已选 {formData.questions.length} 道)
            </span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              全选
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              清空
            </button>
          </div>
        </div>

        {availableQuestions.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
            暂无可用题目，请先创建题目
          </div>
        ) : (
          <div className="border border-gray-300 rounded-md max-h-96 overflow-y-auto">
            {availableQuestions.map((question) => (
              <label
                key={question._id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={formData.questions.includes(question._id)}
                  onChange={() => toggleQuestion(question._id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{question.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-1">{question.content}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty === 'easy' ? '简单' : question.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
        {errors.questions && <p className="mt-1 text-sm text-red-500">{errors.questions}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          取消
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading || availableQuestions.length === 0}
        >
          {loading ? '保存中...' : quiz ? '更新测验' : '创建测验'}
        </button>
      </div>
    </form>
  );
};
