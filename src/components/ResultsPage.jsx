import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

export const ResultsPage = ({ feedback, onRestart }) => {
  if (!feedback) return null;

  const ScoreCircle = ({ score }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - score / 100);

    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-40 h-40 -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black text-white">{score}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-black 
                    flex justify-center px-6 py-12">

      {/* background glow */}
      <div className="absolute top-[-250px] left-1/2 -translate-x-1/2 
                      w-[900px] h-[900px] bg-purple-600/20 blur-[200px]" />

      <div className="relative w-full max-w-6xl">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Interview Complete
          </h1>
          <p className="text-gray-400 mt-3">
            Here’s a detailed breakdown of your performance
          </p>
        </div>

        {/* OVERALL SCORE — CENTERED HERO */}
        <div className="flex justify-center mb-14">
          <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl
                          border border-white/10 rounded-3xl
                          p-10 text-center shadow-2xl">
            <ScoreCircle score={feedback.overallScore} />

            <h2 className="text-2xl font-semibold text-white mt-4">
              Overall Performance
            </h2>

            <p className="text-gray-400 mt-2">
              {feedback.overallScore >= 80
                ? 'Excellent performance — interview ready'
                : feedback.overallScore >= 60
                ? 'Good effort — a bit more polish needed'
                : 'Keep practicing — improvement ahead'}
            </p>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 place-items-stretch">

          {/* TECHNICAL */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Technical Skills
            </h3>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Score</span>
              <span className="text-2xl font-bold text-purple-400">
                {feedback.technicalSkills.score}/100
              </span>
            </div>

            <p className="text-gray-300 mb-4">
              {feedback.technicalSkills.feedback}
            </p>

            {feedback.technicalSkills.weakAreas?.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-400 mb-2">
                  Areas to Improve
                </p>
                <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                  {feedback.technicalSkills.weakAreas.map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* COMMUNICATION */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Communication
            </h3>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Score</span>
              <span className="text-2xl font-bold text-blue-400">
                {feedback.communication.score}/100
              </span>
            </div>

            <p className="text-gray-300">
              {feedback.communication.feedback}
            </p>
          </div>

          {/* CONFIDENCE */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Confidence
            </h3>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Score</span>
              <span className="text-2xl font-bold text-emerald-400">
                {feedback.confidence.score}/100
              </span>
            </div>

            <p className="text-gray-300">
              {feedback.confidence.feedback}
            </p>
          </div>

          {/* BODY LANGUAGE */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Body Language
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Posture Score</span>
                <span className="font-bold text-indigo-400">
                  {feedback.postureScore}/100
                </span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>Stress Level</span>
                <span className={`font-bold ${
                  feedback.stressScore > 70
                    ? 'text-emerald-400'
                    : feedback.stressScore > 50
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {feedback.stressScore}/100
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 text-gray-400">
                <p>Posture warnings: {feedback.postureWarnings}</p>
                <p>Total pauses: {feedback.totalPauses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <TrendingUp size={20} /> Strengths
            </h3>
            <ul className="space-y-2 text-emerald-300">
              {feedback.strengths?.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <AlertCircle size={20} /> Improvement Areas
            </h3>
            <ul className="space-y-2 text-blue-300">
              {feedback.improvements?.map((i, idx) => (
                <li key={idx}>• {i}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="px-10 py-4 rounded-2xl font-bold text-white text-lg
                       bg-gradient-to-r from-purple-600 to-pink-600
                       hover:scale-[1.03] transition-transform shadow-xl"
          >
            Start New Interview
          </button>
        </div>

      </div>
    </div>
  );
};