import { useState, useEffect, useCallback, useRef } from 'react';
import { Question } from '../../types';
import { questionService, QuestionFilters } from '../../services/questionService';

interface QuestionListProps {
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  refreshTrigger?: number;
}

export const QuestionList = ({ onEdit, onDelete, refreshTrigger }: QuestionListProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<QuestionFilters>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  // 搜索框的输入值（受控组件）
  const [searchInput, setSearchInput] = useState('');
  // 标签输入框的值（受控组件）
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [filters, refreshTrigger]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await questionService.getQuestions(filters);
      
      if (response.success && response.data) {
        setQuestions(response.data.questions);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || '获取题目列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 防抖定时器引用
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tagsDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 立即更新的过滤器（不需要防抖）
  const handleFilterChange = (key: keyof QuestionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };
  
  // 搜索输入处理（带防抖）
  const handleSearchChange = useCallback((value: string) => {
    // 立即更新输入框的值
    setSearchInput(value);
    
    // 清除之前的定时器
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }
    
    // 设置新的定时器，500ms 后执行搜索
    searchDebounceTimerRef.current = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: value || undefined, // 空字符串转为 undefined
        page: 1, // Reset to first page when search changes
      }));
    }, 500);
  }, []);
  
  // 标签输入处理（带防抖）
  const handleTagsChange = useCallback((value: string) => {
    // 立即更新输入框的值
    setTagsInput(value);
    
    // 清除之前的定时器
    if (tagsDebounceTimerRef.current) {
      clearTimeout(tagsDebounceTimerRef.current);
    }
    
    // 设置新的定时器，500ms 后执行搜索
    tagsDebounceTimerRef.current = setTimeout(() => {
      // 使用空格分隔标签，过滤空字符串
      const tagsArray = value.trim() ? value.trim().split(/\s+/) : [];
      setFilters(prev => ({
        ...prev,
        tags: tagsArray.length > 0 ? tagsArray.join(',') : undefined,
        page: 1, // Reset to first page when tags change
      }));
    }, 500);
  }, []);
  
  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
      if (tagsDebounceTimerRef.current) {
        clearTimeout(tagsDebounceTimerRef.current);
      }
    };
  }, []);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return difficulty;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              搜索
            </label>
            <input
              type="text"
              placeholder="搜索题目..."
              value={searchInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              难度
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
            >
              <option value="">全部</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标签
            </label>
            <input
              type="text"
              placeholder="标签（空格分隔）"
              value={tagsInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleTagsChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Question List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            暂无题目，点击"创建题目"开始添加
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {question.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {question.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        question.difficulty
                      )}`}
                    >
                      {getDifficultyLabel(question.difficulty)}
                    </span>
                    
                    <span className="text-sm text-gray-500">
                      {question.options.length} 个选项
                    </span>
                    
                    {question.tags.length > 0 && (
                      <div className="flex gap-1">
                        {question.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onEdit(question)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => onDelete(question._id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>
          
          <span className="text-sm text-gray-600">
            第 {pagination.page} / {pagination.pages} 页
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};
