import React, { useState, useEffect } from 'react';
import { analyticsService, QuestionStatistics } from '../../../services/analyticsService';

interface QuestionStatsProps {
  quizId: string;
}

const QuestionStats: React.FC<QuestionStatsProps> = ({ quizId }) => {
  const [stats, setStats] = useState<QuestionStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'difficulty' | 'correctRate' | 'attempts'>('correctRate');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [aiAnalysis, setAiAnalysis] = useState<{ [key: string]: string }>({});
  const [analyzingQuestions, setAnalyzingQuestions] = useState<Set<string>>(new Set());
  const [collapsedAnalyses, setCollapsedAnalyses] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStats();
    loadExistingAnalyses();
  }, [quizId, sortBy, order]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getQuestionStatistics(quizId, { sortBy, order });
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '加载题目统计失败');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAnalyses = async () => {
    try {
      console.log('📚 加载已有的AI分析结果...');
      const analyses = await analyticsService.getQuestionAnalyses(quizId);
      console.log('✅ 加载了', Object.keys(analyses).length, '条分析结果');
      setAiAnalysis(analyses);
      // 默认收起所有已有的分析结果
      setCollapsedAnalyses(new Set(Object.keys(analyses)));
    } catch (err: any) {
      console.warn('⚠️ 加载已有分析结果失败:', err.message);
      // 不显示错误，因为这不是关键功能
    }
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

  const handleAIAnalysis = async (questionId: string) => {
    try {
      console.log('🤖 开始AI分析，题目ID:', questionId, '测验ID:', quizId);
      setAnalyzingQuestions(prev => new Set(prev).add(questionId));
      
      const analysis = await analyticsService.analyzeQuestion(questionId, quizId);
      
      console.log('✅ AI分析成功');
      console.log('分析结果类型:', typeof analysis);
      console.log('分析结果长度:', analysis?.length);
      console.log('分析结果前100字符:', analysis?.substring(0, 100));
      
      if (!analysis || typeof analysis !== 'string') {
        throw new Error('AI返回的分析结果格式不正确');
      }
      
      setAiAnalysis(prev => ({ ...prev, [questionId]: analysis }));
      console.log('✅ 分析结果已保存到状态');
      
    } catch (err: any) {
      console.error('❌ AI分析失败:', err);
      console.error('错误类型:', err.constructor.name);
      console.error('错误消息:', err.message);
      console.error('错误堆栈:', err.stack);
      
      if (err.response) {
        console.error('HTTP状态:', err.response.status);
        console.error('响应数据:', err.response.data);
        console.error('响应头:', err.response.headers);
      }
      
      const errorMessage = err.response?.data?.error?.message 
        || err.response?.data?.message 
        || err.message 
        || 'AI分析失败，请稍后重试';
      
      console.error('显示给用户的错误:', errorMessage);
      alert(`AI分析失败: ${errorMessage}`);
      
    } finally {
      setAnalyzingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 排序控件 */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="difficulty">难度</option>
            <option value="correctRate">正确率</option>
            <option value="attempts">答题次数</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">排序顺序</label>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as any)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="asc">升序</option>
            <option value="desc">降序</option>
          </select>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="space-y-4">
        {stats.questionStats.map((question, index) => (
          <div key={question.questionId} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold text-gray-900">题目 {index + 1}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {getDifficultyLabel(question.difficulty)}
                  </span>
                </div>
                <h4 className="text-base font-medium text-gray-900 mb-2">{question.title}</h4>
                <p className="text-sm text-gray-600">{question.content}</p>
              </div>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-600 mb-1">答题次数</div>
                <div className="text-xl font-bold text-gray-900">{question.totalAttempts}</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-600 mb-1">正确次数</div>
                <div className="text-xl font-bold text-green-600">{question.correctAttempts}</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-600 mb-1">正确率</div>
                <div className="text-xl font-bold text-blue-600">{question.correctRate.toFixed(1)}%</div>
              </div>
            </div>

            {/* 选项统计 */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">选项统计</h5>
              {question.optionStats.map((option) => (
                <div key={option.optionId} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm ${option.isCorrect ? 'font-medium text-green-700' : 'text-gray-700'}`}>
                        {option.optionId}. {option.optionText}
                        {option.isCorrect && ' ✓'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {option.selectedCount} 人 ({option.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${option.isCorrect ? 'bg-green-500' : 'bg-gray-400'}`}
                        style={{ width: `${option.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI分析按钮和结果 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {!aiAnalysis[question.questionId] ? (
                <button
                  onClick={() => handleAIAnalysis(question.questionId)}
                  disabled={analyzingQuestions.has(question.questionId)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {analyzingQuestions.has(question.questionId) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>AI分析中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>AI解题分析</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-purple-700 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI解题分析
                    </h5>
                    <button
                      onClick={() => {
                        setCollapsedAnalyses(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(question.questionId)) {
                            newSet.delete(question.questionId);
                          } else {
                            newSet.add(question.questionId);
                          }
                          return newSet;
                        });
                      }}
                      className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      {collapsedAnalyses.has(question.questionId) ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <span>展开</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <span>收起</span>
                        </>
                      )}
                    </button>
                  </div>
                  {!collapsedAnalyses.has(question.questionId) && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {aiAnalysis[question.questionId]}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionStats;
