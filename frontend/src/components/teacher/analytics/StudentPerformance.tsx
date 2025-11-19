import React, { useState, useEffect } from 'react';
import { analyticsService, StudentPerformance as StudentPerformanceData } from '../../../services/analyticsService';

interface StudentPerformanceProps {
  quizId: string;
}

const StudentPerformance: React.FC<StudentPerformanceProps> = ({ quizId }) => {
  const [data, setData] = useState<StudentPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'percentage' | 'timeSpent' | 'submitTime'>('score');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [minScore, setMinScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [quizId, sortBy, order]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { sortBy, order };
      if (minScore) params.minScore = Number(minScore);
      if (maxScore) params.maxScore = Number(maxScore);
      
      const result = await analyticsService.getStudentPerformance(quizId, params);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '加载学生表现数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadData();
  };

  const exportToCSV = () => {
    if (!data) return;

    // 辅助函数：转义CSV字段（处理包含逗号、引号、换行符的情况）
    const escapeCSVField = (field: any): string => {
      const str = String(field);
      // 如果字段包含逗号、引号或换行符，需要用引号包裹，并将引号转义为双引号
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['排名', '学生姓名', '用户名', '邮箱', '分数', '总题数', '正确率', '用时(秒)', '提交时间'];
    const rows = data.students.map(student => [
      student.rank,
      student.studentName,
      student.username,
      student.email,
      student.score,
      student.totalQuestions,
      `${student.percentage}%`,
      student.timeSpent,
      new Date(student.submitTime).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    ]);

    const csvContent = [
      headers.map(escapeCSVField).join(','),
      ...rows.map(row => row.map(escapeCSVField).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `学生表现_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
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

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 筛选和排序控件 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="score">分数</option>
              <option value="percentage">正确率</option>
              <option value="timeSpent">用时</option>
              <option value="submitTime">提交时间</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">排序顺序</label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最低分数</label>
            <input
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              placeholder="不限"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最高分数</label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              placeholder="不限"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            应用筛选
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            导出 CSV
          </button>
        </div>
      </div>

      {/* 学生列表 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  学生信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  正确率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  答题情况
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用时
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  提交时间
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.students.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {student.rank <= 3 ? (
                        <span className="text-2xl">
                          {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{student.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                    <div className="text-sm text-gray-500">{student.username}</div>
                    <div className="text-xs text-gray-400">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.score} / {student.totalQuestions}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${getPerformanceColor(student.percentage)}`}>
                      {student.percentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="text-green-600">✓ {student.correctAnswers}</span>
                      {' / '}
                      <span className="text-red-600">✗ {student.incorrectAnswers}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatTime(student.timeSpent)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(student.submitTime).toLocaleString('zh-CN')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.students.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无学生提交数据
        </div>
      )}
    </div>
  );
};

export default StudentPerformance;
