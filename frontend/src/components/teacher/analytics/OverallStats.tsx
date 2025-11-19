import React, { useState, useEffect } from 'react';
import { analyticsService, OverallStatistics } from '../../../services/analyticsService';

interface OverallStatsProps {
  quizId: string;
}

const OverallStats: React.FC<OverallStatsProps> = ({ quizId }) => {
  const [stats, setStats] = useState<OverallStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [quizId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getOverallStatistics({ quizId });
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '加载统计数据失败');
    } finally {
      setLoading(false);
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-sm font-medium text-blue-600 mb-1">总提交数</div>
          <div className="text-3xl font-bold text-blue-900">{stats.totalSubmissions}</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="text-sm font-medium text-green-600 mb-1">参与学生数</div>
          <div className="text-3xl font-bold text-green-900">{stats.totalStudents}</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="text-sm font-medium text-purple-600 mb-1">平均分数</div>
          <div className="text-3xl font-bold text-purple-900">{stats.averageScore.toFixed(1)}</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-6">
          <div className="text-sm font-medium text-orange-600 mb-1">平均正确率</div>
          <div className="text-3xl font-bold text-orange-900">{stats.averagePercentage.toFixed(1)}%</div>
        </div>
      </div>

      {/* 平均用时 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="text-sm font-medium text-gray-600 mb-1">平均用时</div>
        <div className="text-2xl font-bold text-gray-900">{formatTime(stats.averageTimeSpent)}</div>
      </div>

      {/* 分数分布 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">分数分布</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">优秀 (≥90%)</span>
              <span className="text-sm font-medium text-gray-900">{stats.scoreDistribution.excellent} 人</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${stats.totalSubmissions > 0 ? (stats.scoreDistribution.excellent / stats.totalSubmissions) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">良好 (70-89%)</span>
              <span className="text-sm font-medium text-gray-900">{stats.scoreDistribution.good} 人</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${stats.totalSubmissions > 0 ? (stats.scoreDistribution.good / stats.totalSubmissions) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">及格 (60-69%)</span>
              <span className="text-sm font-medium text-gray-900">{stats.scoreDistribution.average} 人</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{
                  width: `${stats.totalSubmissions > 0 ? (stats.scoreDistribution.average / stats.totalSubmissions) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">不及格 (&lt;60%)</span>
              <span className="text-sm font-medium text-gray-900">{stats.scoreDistribution.poor} 人</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{
                  width: `${stats.totalSubmissions > 0 ? (stats.scoreDistribution.poor / stats.totalSubmissions) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallStats;
