import React from 'react';
import { Mic, MicOff, Clock } from 'lucide-react';

export const AnswerInput = ({
  answer,
  setAnswer,
  isRecording,
  pauseCount,
  onStartRecording,
  onStopRecording,
  onSubmit,
  isLastQuestion
}) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-semibold">Your Answer:</span>
        <div className="flex gap-2">
          {!isRecording ? (
            <button
              onClick={onStartRecording}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={onStopRecording}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 animate-pulse"
            >
              <MicOff className="w-5 h-5" />
              Stop Recording
            </button>
          )}
        </div>
      </div>
      
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer will appear here as you speak, or type directly..."
        className="w-full bg-gray-800 text-white rounded-lg p-4 min-h-50 border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
      />

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Pauses: {pauseCount}
          </span>
          <span>Words: {answer.trim().split(/\s+/).filter(Boolean).length}</span>
        </div>
        <button
          onClick={onSubmit}
          disabled={!answer.trim()}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all font-semibold"
        >
          {isLastQuestion ? 'Finish Interview' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};