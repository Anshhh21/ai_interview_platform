import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, TrendingUp, CheckCircle, Activity, User, XCircle } from 'lucide-react';

export const InterviewPage = ({ 
  questions, currentQuestion, isRecording, 
  currentAnswer, setCurrentAnswer, stressLevel, postureWarnings, videoRef, startCamera,
  startDetection,
  onStartRecording, onStopRecording, onSubmitAnswer, 
  onEndInterview, // <--- This function comes from App.jsx
  isLoading, isAnalyzing, pauseCount
}) => {

  // 1. Initialize Camera
  useEffect(() => {
    if (!isLoading && videoRef.current) {
      startCamera();
    }
  }, [isLoading, startCamera, videoRef]);

  // 2. Start Pose Detection when video loads
  const handleVideoLoad = () => {
    if (videoRef.current && startDetection) {
      startDetection(videoRef.current);
    }
  };

  // --- LOADING STATE: ANALYZING RESULTS ---
  // This shows when you click "Finish" and wait for Gemini
  if (isAnalyzing) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white space-y-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Generating Performance Report</h2>
        <p className="text-slate-400">Analyzing stress levels, posture, and answer quality...</p>
      </div>
    </div>
  );

  // --- LOADING STATE: PREPARING QUESTIONS ---
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-500 font-medium">Preparing AI Interviewer...</p>
    </div>
  );

  // Helper Logic
  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentPostureStatus = postureWarnings.length > 0 
    ? postureWarnings[postureWarnings.length - 1].type 
    : "Good Posture";
  const isPostureBad = postureWarnings.length > 0 && 
    (Date.now() - postureWarnings[postureWarnings.length - 1].time < 3000);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      
      {/* HEADER WITH END BUTTON */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-700">AI Interview Session</h1>
        <button 
          onClick={onEndInterview}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
        >
          <XCircle size={18} /> End Session Early
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Camera Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative group bg-slate-900 rounded-3xl overflow-hidden shadow-2xl aspect-video border-4 border-white">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              onLoadedMetadata={handleVideoLoad}
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            
            <div className="absolute top-6 left-6 flex gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md ${isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-black/40 text-white'}`}>
                <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isRecording ? 'Recording' : 'Standby'}
                </span>
              </div>
            </div>

            {isPostureBad && (
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-amber-500 text-amber-950 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-amber-950/10 p-2 rounded-lg">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase opacity-70">Correction Needed</p>
                    <p className="font-medium">{currentPostureStatus}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transcript Box */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Live Transcript</h3>
              <div className="flex gap-3">
                {!isRecording ? (
                  <button onClick={onStartRecording} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all hover:shadow-lg active:scale-95">
                    <Mic size={20} /> Unmute & Start
                  </button>
                ) : (
                  <button onClick={onStopRecording} className="flex items-center gap-2 bg-slate-100 text-slate-600 hover:bg-slate-200 px-6 py-3 rounded-2xl font-bold transition-all">
                    <MicOff size={20} /> Pause
                  </button>
                )}
              </div>
            </div>
            
            <textarea 
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer && setCurrentAnswer(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Type your answer here if voice fails..."}
              className="w-full p-6 bg-slate-50 rounded-2xl min-h-[120px] border border-slate-100 italic text-slate-700 leading-relaxed text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Analytics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="mb-6">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em]">Session</span>
              <div className="flex items-end gap-2 mt-1">
                <h2 className="text-4xl font-black text-slate-900">{currentQuestion + 1}</h2>
                <span className="text-slate-400 font-bold mb-1.5">/ {questions.length}</span>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mb-8">
              <h2 className="text-lg font-bold text-blue-900 leading-snug">
                "{questions[currentQuestion]?.question}"
              </h2>
            </div>

            <div className="space-y-6 flex-grow">
              {/* Stress Metric */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                    <Activity size={16} /> Vocal Stress
                  </span>
                  <span className={`text-sm font-black ${stressLevel > 60 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {Math.round(stressLevel)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${stressLevel > 60 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${stressLevel}%` }}
                  />
                </div>
              </div>

              {/* Posture Metric */}
              <div>
                 <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                    <User size={16} /> Body Language
                  </span>
                  <span className={`text-sm font-black ${isPostureBad ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {isPostureBad ? 'Adjust' : 'Good'}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${isPostureBad ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'} text-sm font-medium transition-all`}>
                  {currentPostureStatus}
                </div>
              </div>
            </div>

            {/* DYNAMIC END BUTTON */}
            <button 
              onClick={onSubmitAnswer}
              disabled={(!currentAnswer || currentAnswer.trim().length === 0) && !isRecording}
              className={`w-full mt-8 py-5 rounded-2xl font-bold text-lg shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3 ${
                isLastQuestion 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" 
                  : "bg-slate-900 hover:bg-black text-white"
              }`}
            >
              {isLastQuestion ? (
                 <>Finish Interview <CheckCircle size={20} /></>
              ) : (
                 <>Next Question <CheckCircle size={20} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};