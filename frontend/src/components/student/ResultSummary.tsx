import React from 'react';
import { Submission } from '../../types';

interface ResultSummaryProps {
  submission: Submission;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({ submission }) => {
  const percentage = Math.round((submission.score / submission.totalQuestions) * 100);
  const timeSpentMinutes = Math.floor(submission.timeSpent / 60);
  const timeSpentSeconds = submission.timeSpent % 60;

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-50 border-green-200';
    if (percent >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${getScoreBgColor(percentage)}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">测验完成！</h2>
        
        {/* Score circle */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                className={getScoreColor(percentage)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">总题数</p>
            <p className="text-2xl font-bold text-gray-800">{submission.totalQuestions}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">答对</p>
            <p className="text-2xl font-bold text-green-600">{submission.score}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">答错</p>
            <p className="text-2xl font-bold text-red-600">
              {submission.totalQuestions - submission.score}
            </p>
          </div>
        </div>

        {/* Time spent */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">用时</p>
          <p className="text-xl font-semibold text-gray-800">
            {timeSpentMinutes > 0 && `${timeSpentMinutes} 分钟 `}
            {timeSpentSeconds} 秒
          </p>
        </div>
      </div>
    </div>
  );
};
