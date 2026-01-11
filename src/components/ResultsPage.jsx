import React from 'react';
// import { TrendingUp, AlertCircle } from 'lucide-react'; // Uncomment if using icons

export const ResultsPage = ({ feedback, onRestart }) => {
  if (!feedback) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Analysis Failed</h2>
        <button onClick={onRestart} className="bg-blue-600 px-6 py-2 rounded-xl">Try Again</button>
      </div>
    </div>
  );

  const ScoreCircle = ({ score = 0 }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const safeScore = Math.min(100, Math.max(0, score));
    const offset = circumference * (1 - safeScore / 100);

    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-40 h-40 -rotate-90">
          <circle cx="80" cy="80" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
          <circle cx="80" cy="80" r={radius} stroke="url(#scoreGradient)" strokeWidth="12" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black text-white">{Math.round(safeScore)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-12 relative overflow-hidden">
      <div className="absolute -top-62.5 left-1/2 -translate-x-1/2 w-225 h-225 bg-purple-600/10 blur-[200px]" />

      <div className="relative w-full max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold">Interview Analysis</h1>
          <p className="text-gray-400 mt-3">Here is how you performed</p>
        </div>

        <div className="flex justify-center mb-14">
          <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
            <ScoreCircle score={feedback.overallScore} />
            <h2 className="text-2xl font-semibold mt-4">Overall Score</h2>
            <p className="text-gray-400 mt-2">
              {feedback.overallScore >= 80 ? 'Outstanding! Ready for hire.' : feedback.overallScore >= 60 ? 'Good job, just a few tweaks needed.' : 'Keep practicing, you are getting there!'}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* TECHNICAL SECTION */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-3">Technical Skills</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Score</span>
              <span className="text-2xl font-bold text-purple-400">{feedback.technicalSkills?.score || 0}/100</span>
            </div>
            <p className="text-gray-300 mb-4">{feedback.technicalSkills?.feedback}</p>
            {feedback.technicalSkills?.weakAreas?.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-400 mb-2">Focus Areas</p>
                <ul className="list-disc list-inside text-sm text-red-300">{feedback.technicalSkills.weakAreas.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            )}
          </div>

          {/* COMMUNICATION SECTION */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-3">Communication</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Score</span>
              <span className="text-2xl font-bold text-blue-400">{feedback.communication?.score || 0}/100</span>
            </div>
            <p className="text-gray-300">{feedback.communication?.feedback}</p>
          </div>

          {/* CONFIDENCE SECTION */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-3">Confidence</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Score</span>
              <span className="text-2xl font-bold text-emerald-400">{feedback.confidence?.score || 0}/100</span>
            </div>
            <p className="text-gray-300">{feedback.confidence?.feedback}</p>
          </div>

          {/* AI BODY LANGUAGE SECTION */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">AI Body Analysis</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-gray-300">
                <span>Posture Score</span>
                <span className={`font-bold text-xl ${feedback.postureScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {feedback.postureScore}/100
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span>Composure (Calmness)</span>
                <span className={`font-bold text-xl ${feedback.stressScore > 80 ? 'text-green-400' : 'text-blue-400'}`}>
                    {feedback.stressScore}/100
                </span>
              </div>
              <div className="pt-3 border-t border-white/10 text-gray-400 flex justify-between">
                 <span>Posture Warnings: {feedback.postureWarnings}</span>
                 <span>Pauses detected: {feedback.totalPauses}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button onClick={onRestart} className="px-10 py-4 rounded-2xl font-bold text-white text-lg bg-linear-to-r from-purple-600 to-pink-600 hover:scale-[1.03] transition-transform">
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
};