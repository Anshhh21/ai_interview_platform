import React, { useEffect } from 'react';
import {
  Mic, MicOff, AlertCircle, Activity, User, XCircle, CheckCircle
} from 'lucide-react';

export const InterviewPage = ({
  questions, currentQuestion, isRecording,
  currentAnswer, setCurrentAnswer, stressLevel,
  postureWarnings, videoRef, startCamera,
  startDetection,
  onStartRecording, onStopRecording, onSubmitAnswer,
  onEndInterview,
  isLoading, isAnalyzing
}) => {

  useEffect(() => {
    if (!isLoading && videoRef.current) {
      startCamera();
    }
  }, [isLoading, startCamera, videoRef]);

  const handleVideoLoad = () => {
    if (videoRef.current && startDetection) {
      startDetection(videoRef.current);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-bold">Analyzing Interview</h2>
          <p className="text-slate-400">Generating performance report…</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-12 h-12 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  const isLastQuestion = currentQuestion === questions.length - 1;
  const isPostureBad = postureWarnings.length > 0 &&
    Date.now() - postureWarnings[postureWarnings.length - 1].time < 3000;

  const postureText = postureWarnings.length
    ? postureWarnings[postureWarnings.length - 1].type
    : 'Good Posture';

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-700">AI Interview Session</h1>
        <button
          onClick={onEndInterview}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          <XCircle size={18} />
          End Session
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT — CAMERA */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl aspect-video border border-slate-200">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onLoadedMetadata={handleVideoLoad}
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* STATUS */}
            <div className="absolute top-4 left-4">
              <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-md
                ${isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-black/40 text-white'}`}
              >
                {isRecording ? 'Recording' : 'Standby'}
              </div>
            </div>

            {/* POSTURE WARNING */}
            {isPostureBad && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-amber-500 text-amber-900 px-6 py-4 rounded-2xl flex gap-3 items-center shadow-xl">
                  <AlertCircle />
                  <div>
                    <p className="text-xs font-bold uppercase">Correction Needed</p>
                    <p className="font-medium">{postureText}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TRANSCRIPT */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Live Transcript</h3>
              {!isRecording ? (
                <button
                  onClick={onStartRecording}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                >
                  <Mic size={18} /> Start
                </button>
              ) : (
                <button
                  onClick={onStopRecording}
                  className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                >
                  <MicOff size={18} /> Pause
                </button>
              )}
            </div>

            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Speak or type your answer…"
              className="w-full min-h-30 bg-slate-50 rounded-2xl p-6 text-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* RIGHT — QUESTION + METRICS */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-full flex flex-col">

            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-blue-600 font-bold">Session</span>
              <h2 className="text-4xl font-black text-slate-900">
                {currentQuestion + 1}
                <span className="text-slate-400 text-xl"> / {questions.length}</span>
              </h2>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
              <p className="font-semibold text-blue-900">
                "{questions[currentQuestion]?.question}"
              </p>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Activity size={16} /> Vocal Stress
                  </span>
                  <span className={stressLevel > 60 ? 'text-red-500' : 'text-emerald-500'}>
                    {Math.round(stressLevel)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className={`h-full ${stressLevel > 60 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${stressLevel}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="flex items-center gap-2 text-slate-500">
                    <User size={16} /> Body Language
                  </span>
                  <span className={isPostureBad ? 'text-amber-500' : 'text-emerald-500'}>
                    {isPostureBad ? 'Adjust' : 'Good'}
                  </span>
                </div>
                <div className={`p-3 rounded-xl text-sm font-medium
                  ${isPostureBad ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {postureText}
                </div>
              </div>
            </div>

            <button
              onClick={onSubmitAnswer}
              className="mt-8 w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2
              bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition"
            >
              {isLastQuestion ? 'Finish Interview' : 'Next Question'}
              <CheckCircle size={18} />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};