import React from 'react';

export const QuestionCard = ({ question, questionNumber, totalQuestions }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-900 text-green-200';
      case 'medium': return 'bg-yellow-900 text-yellow-200';
      case 'hard': return 'bg-red-900 text-red-200';
      default: return 'bg-gray-900 text-gray-200';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
          <span className="text-white font-bold">{questionNumber}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl text-white font-semibold mb-2">
            {question.question}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
            <span className="text-gray-400 text-sm">
              {questionNumber} of {totalQuestions}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};