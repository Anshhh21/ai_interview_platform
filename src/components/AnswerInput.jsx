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
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Your Answer</h3>

        {!isRecording ? (
          <button
            onClick={onStartRecording}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex gap-2"
          >
            <Mic size={18} /> Start Speaking
          </button>
        ) : (
          <button
            onClick={onStopRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold flex gap-2 animate-pulse"
          >
            <MicOff size={18} /> Pause
          </button>
        )}
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Speak or type your answer…"
        className="w-full min-h-35 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none"
      />

      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-6 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={14} /> Pauses: {pauseCount}
          </span>
          <span>Words: {wordCount}</span>
        </div>

        <button
          onClick={onSubmit}
          disabled={!answer.trim()}
          className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-40"
        >
          {isLastQuestion ? 'Finish Interview' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};