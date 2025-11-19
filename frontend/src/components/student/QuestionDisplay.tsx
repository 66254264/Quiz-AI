import React from 'react';
import { Question } from '../../types';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answerId: string) => void;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Progress indicator */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-600">
            题目 {questionNumber} / {totalQuestions}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">
            {question.difficulty && (
              <span className={`px-2 py-1 rounded text-xs ${
                question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficulty === 'easy' ? '简单' :
                 question.difficulty === 'medium' ? '中等' : '困难'}
              </span>
            )}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question title and content */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
          {question.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{question.content}</p>
      </div>

      {/* Options - Touch-friendly with larger tap targets */}
      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onAnswerSelect(option.id)}
            className={`w-full text-left p-4 sm:p-4 rounded-lg border-2 transition-all min-h-[56px] touch-manipulation active:scale-[0.98] ${
              selectedAnswer === option.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center ${
                selectedAnswer === option.id
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}>
                {selectedAnswer === option.id && (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm sm:text-base text-gray-800 flex-1">{option.text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
