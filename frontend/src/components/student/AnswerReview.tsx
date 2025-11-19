import React from 'react';

interface AnswerReviewProps {
  answers: {
    questionId: string;
    question: {
      title: string;
      content: string;
      options: { id: string; text: string }[];
      explanation?: string;
    } | null;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

export const AnswerReview: React.FC<AnswerReviewProps> = ({ answers }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">答题详情</h3>
      
      {answers.map((answer, index) => {
        if (!answer.question) return null;
        const isCorrect = answer.isCorrect;

        return (
          <div
            key={answer.questionId}
            className={`bg-white rounded-lg border-2 p-6 ${
              isCorrect ? 'border-green-200' : 'border-red-200'
            }`}
          >
            {/* Question header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    题目 {index + 1}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {answer.question.title}
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{answer.question.content}</p>
              </div>
              
              {/* Result badge */}
              <div className={`flex-shrink-0 ml-4 px-4 py-2 rounded-lg ${
                isCorrect ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isCorrect ? (
                  <div className="flex items-center text-green-800">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">正确</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-800">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">错误</span>
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-4">
              {answer.question.options.map((option) => {
                const isSelected = option.id === answer.selectedAnswer;
                const isCorrectAnswer = option.id === answer.correctAnswer;

                return (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrectAnswer
                        ? 'border-green-500 bg-green-50'
                        : isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {isCorrectAnswer && (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {isSelected && !isCorrectAnswer && (
                          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {!isSelected && !isCorrectAnswer && (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`${
                          isCorrectAnswer ? 'text-green-900 font-medium' :
                          isSelected ? 'text-red-900 font-medium' :
                          'text-gray-700'
                        }`}>
                          {option.text}
                        </p>
                        {isCorrectAnswer && (
                          <p className="text-sm text-green-700 mt-1">✓ 正确答案</p>
                        )}
                        {isSelected && !isCorrectAnswer && (
                          <p className="text-sm text-red-700 mt-1">✗ 您的选择</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            {answer.question.explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">解析</p>
                <p className="text-sm text-blue-800">{answer.question.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
