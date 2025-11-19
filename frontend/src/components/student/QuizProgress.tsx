import React from 'react';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  onQuestionNavigate: (questionIndex: number) => void;
  answers: Record<number, string>;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  onQuestionNavigate,
  answers,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">答题进度</h3>
      
      {/* Progress summary */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>已答题: {answeredQuestions} / {totalQuestions}</span>
          <span>{Math.round((answeredQuestions / totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question grid */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionNum = index + 1;
          const isAnswered = answers[index] !== undefined;
          const isCurrent = index === currentQuestion;

          return (
            <button
              key={index}
              onClick={() => onQuestionNavigate(index)}
              className={`
                aspect-square rounded-md text-sm font-medium transition-all
                ${isCurrent
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : isAnswered
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {questionNum}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
          <span>当前题目</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
          <span>已答题</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
          <span>未答题</span>
        </div>
      </div>
    </div>
  );
};
