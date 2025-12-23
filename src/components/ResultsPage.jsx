import React from 'react';
import { Award, TrendingUp, AlertCircle } from 'lucide-react';

export const ResultsPage = ({ feedback, onRestart }) => {
  if (!feedback) return null;

  const ScoreCircle = ({ score, color = 'purple' }) => {
    const circumference = 2 * Math.PI * 70;
    const offset = circumference * (1 - score / 100);

    return (
      <div className="relative w-40 h-40 mx-auto mb-4">
        <svg className="transform -rotate-90 w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke={`rgb(139, 92, 246)`}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-purple-600">{score}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Interview Complete!</h1>
          <p className="text-gray-300">Here's your detailed performance analysis</p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center">
            <ScoreCircle score={feedback.overallScore} />
            <h2 className="text-2xl font-bold text-gray-800">Overall Performance</h2>
            <p className="text-gray-600 mt-2">
              {feedback.overallScore >= 80 ? 'Excellent!' : 
               feedback.overallScore >= 60 ? 'Good job!' : 
               'Keep practicing!'}
            </p>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Technical Skills */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Technical Skills</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Score</span>
              <span className="text-2xl font-bold text-purple-600">
                {feedback.technicalSkills.score}/100
              </span>
            </div>
            <p className="text-gray-700 mb-3">{feedback.technicalSkills.feedback}</p>
            {feedback.technicalSkills.weakAreas && feedback.technicalSkills.weakAreas.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-800 mb-2">Areas to Improve:</p>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {feedback.technicalSkills.weakAreas.map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Communication */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Communication</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Score</span>
              <span className="text-2xl font-bold text-blue-600">
                {feedback.communication.score}/100
              </span>
            </div>
            <p className="text-gray-700">{feedback.communication.feedback}</p>
          </div>

          {/* Confidence */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confidence</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Score</span>
              <span className="text-2xl font-bold text-green-600">
                {feedback.confidence.score}/100
              </span>
            </div>
            <p className="text-gray-700">{feedback.confidence.feedback}</p>
          </div>

          {/* Body Language */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Body Language</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Posture Score</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {feedback.postureScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Stress Level</span>
                <span className={`font-semibold ${
                  feedback.stressScore > 70 ? 'text-green-600' : 
                  feedback.stressScore > 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {feedback.stressScore}/100
                </span>
              </div>
              <div className="text-sm text-gray-600 pt-2 border-t">
                <p>Posture warnings: {feedback.postureWarnings}</p>
                <p>Total pauses: {feedback.totalPauses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Key Strengths
            </h3>
            <ul className="space-y-2">
              {feedback.strengths?.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-green-700">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Improvement Areas
            </h3>
            <ul className="space-y-2">
              {feedback.improvements?.map((improvement, i) => (
                <li key={i} className="flex items-start gap-2 text-blue-700">
                  <span className="text-blue-600 mt-1">→</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
          >
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
};
