import React, { useEffect, useState, useRef } from 'react';
import {
  Mic, MicOff, AlertCircle, XCircle, CheckCircle, Clock
} from 'lucide-react';
import { speakText, stopSpeaking } from '../services/speechService'; 

export const InterviewPage = ({
  questions, currentQuestion, isRecording,
  currentAnswer, setCurrentAnswer, stressLevel,
  postureWarnings, videoRef, startCamera,
  startDetection,
  onStartRecording, onStopRecording, onSubmitAnswer,
  onEndInterview,
  isLoading, isAnalyzing
}) => {

  const [hasSpokenCurrent, setHasSpokenCurrent] = useState(false);
  const [showPauseWarning, setShowPauseWarning] = useState(false);
  const lastSpeechTimeRef = useRef(Date.now());
  const questionSpokenRef = useRef(false);

  useEffect(() => {
    if (!isLoading && videoRef.current) {
      startCamera();
    }
  }, [isLoading, startCamera, videoRef]);

  useEffect(() => {
    setHasSpokenCurrent(false);
    questionSpokenRef.current = false;
    stopSpeaking();
    setShowPauseWarning(false);
  }, [currentQuestion]);

  useEffect(() => {
    if (isRecording && !questionSpokenRef.current && questions && questions[currentQuestion]) {
        const timer = setTimeout(() => {
            speakText(questions[currentQuestion].question);
            questionSpokenRef.current = true;
            setHasSpokenCurrent(true);
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [isRecording, questions, currentQuestion]);

  // --- PAUSE DETECTION UPDATED TO 7 SECONDS ---
  useEffect(() => {
    let pauseInterval;
    
    if (isRecording) {
      lastSpeechTimeRef.current = Date.now();
      if (showPauseWarning) setShowPauseWarning(false); 

      pauseInterval = setInterval(() => {
        const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
        
        // CHANGED: 4000 -> 7000 (7 Seconds)
        if (timeSinceLastSpeech > 5000) {
           setShowPauseWarning(true);
        }
      }, 1000);
    } else {
      setShowPauseWarning(false);
    }

    return () => clearInterval(pauseInterval);
  }, [currentAnswer, isRecording]); 

  // --- ENSURE POSE DETECTION STARTS ---
  const handleVideoLoad = () => {
    // We try to start detection immediately when metadata loads
    if (videoRef.current && startDetection) {
      console.log("🎥 Video Loaded, requesting detection start...");
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

  const isLastQuestion = questions && currentQuestion === questions.length - 1;
  const isPostureBad = postureWarnings && postureWarnings.length > 0 &&
    Date.now() - postureWarnings[postureWarnings.length - 1].time < 3000;

  const postureText = postureWarnings && postureWarnings.length
    ? postureWarnings[postureWarnings.length - 1].type
    : 'Good Posture';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
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
        <div className="lg:col-span-8 space-y-6">
          <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl aspect-video border border-slate-200">
            <video
              ref={videoRef}
              autoPlay
              muted
              width="640"
              height="480"
              playsInline
              onLoadedMetadata={handleVideoLoad} 
              onPlay={() => console.log("▶️ Video playing")} 
              className="w-full h-full object-cover scale-x-[-1]"
            />
            
            {isPostureBad && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-amber-500 text-amber-900 px-6 py-4 rounded-2xl flex gap-3 items-center shadow-xl animate-bounce">
                  <AlertCircle />
                  <div>
                    <p className="text-xs font-bold uppercase">Correction Needed</p>
                    <p className="font-medium">{postureText}</p>
                  </div>
                </div>
              </div>
            )}

            {showPauseWarning && !isPostureBad && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-blue-500 text-white px-6 py-4 rounded-2xl flex gap-3 items-center shadow-xl animate-pulse">
                  <Clock />
                  <div>
                    <p className="text-xs font-bold uppercase">Long Pause Detected</p>
                    <p className="font-medium">Try to keep your answer flowing</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Live Transcript</h3>
              {!isRecording ? (
                <button
                  onClick={onStartRecording}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                >
                  <Mic size={18} /> Start Recording
                </button>
              ) : (
                <button
                  onClick={onStopRecording}
                  className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                >
                  <MicOff size={18} /> Stop Recording
                </button>
              )}
            </div>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Your answer will appear here as you speak..."
              className="w-full min-h-32 bg-slate-50 rounded-2xl p-6 text-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-blue-600 font-bold">Question</span>
              <h2 className="text-4xl font-black text-slate-900">
                {currentQuestion + 1}
                <span className="text-slate-400 text-xl"> / {questions ? questions.length : 0}</span>
              </h2>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
              <p className="font-semibold text-blue-900">
                "{questions && questions[currentQuestion]?.question}"
              </p>
            </div>
            <button
              onClick={onSubmitAnswer}
              className="mt-auto w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2
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