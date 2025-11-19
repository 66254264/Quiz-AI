import { useState, useEffect } from 'react';
import { Question } from '../../types';
import { questionService, CreateQuestionData } from '../../services/questionService';

interface QuestionFormProps {
  question?: Question | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const QuestionForm = ({ question, onSuccess, onCancel }: QuestionFormProps) => {
  const [formData, setFormData] = useState<CreateQuestionData>({
    title: '',
    content: '',
    options: [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
    ],
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title,
        content: question.content,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || '',
        difficulty: question.difficulty,
        tags: question.tags,
      });
    }
  }, [question]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '题目标题不能为空';
    }

    if (!formData.content.trim()) {
      newErrors.content = '题目内容不能为空';
    }

    if (formData.options.length < 2) {
      newErrors.options = '至少需要2个选项';
    }

    formData.options.forEach((option, index) => {
      if (!option.text.trim()) {
        newErrors[`option_${index}`] = '选项内容不能为空';
      }
    });

    if (!formData.correctAnswer) {
      newErrors.correctAnswer = '请选择正确答案';
    }

    const optionIds = formData.options.map(opt => opt.id);
    if (!optionIds.includes(formData.correctAnswer)) {
      newErrors.correctAnswer = '正确答案必须是选项之一';
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
      const response = question
        ? await questionService.updateQuestion(question._id, formData)
        : await questionService.createQuestion(formData);

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

  const handleAddOption = () => {
    if (formData.options.length >= 6) {
      return;
    }
    const nextId = String.fromCharCode(65 + formData.options.length); // A, B, C, D, E, F
    setFormData({
      ...formData,
      options: [...formData.options, { id: nextId, text: '' }],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length <= 2) {
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...formData.options];
    newOptions[index].text = text;
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {submitError}
        </div>
      )}
      
      {/* Debug info */}
      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
        表单已加载 - {question ? '编辑模式' : '创建模式'}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          题目标题 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="输入题目标题"
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          题目内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="输入题目内容"
        />
        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选项 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {formData.options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <span className="flex items-center justify-center w-8 h-10 bg-gray-100 rounded font-medium">
                {option.id}
              </span>
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`option_${index}`] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={`选项 ${option.id}`}
              />
              {formData.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  删除
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.options && <p className="mt-1 text-sm text-red-500">{errors.options}</p>}
        
        {formData.options.length < 6 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="mt-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            + 添加选项
          </button>
        )}
      </div>

      {/* Correct Answer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          正确答案 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.correctAnswer}
          onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.correctAnswer ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">选择正确答案</option>
          {formData.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.id} - {option.text || '(未填写)'}
            </option>
          ))}
        </select>
        {errors.correctAnswer && <p className="mt-1 text-sm text-red-500">{errors.correctAnswer}</p>}
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          答案解析
        </label>
        <textarea
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入答案解析（可选）"
        />
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          难度
        </label>
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标签
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入标签后按回车"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            添加
          </button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
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
          disabled={loading}
        >
          {loading ? '保存中...' : question ? '更新题目' : '创建题目'}
        </button>
      </div>
    </form>
  );
};
