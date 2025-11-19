import React from 'react';
import { Quiz } from '../../types';

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quizId: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all active:scale-[0.98]">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h3>
      {quiz.description && (
        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 mb-4 gap-2">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          题目数量: {quiz.questions.length}
        </span>
        {quiz.timeLimit && (
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            时间限制: {quiz.timeLimit} 分钟
          </span>
        )}
      </div>
      <button
        onClick={() => onStart(quiz._id)}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all active:scale-95 font-medium text-sm sm:text-base min-h-[44px] touch-manipulation"
      >
        开始答题
      </button>
    </div>
  );
};
