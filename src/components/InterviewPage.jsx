import React, { useEffect } from 'react';
import { StopCircle, Activity } from 'lucide-react';
import { CameraView } from './CameraView';
import { QuestionCard } from './QuestionCard';
import { AnswerInput } from './AnswerInput';
import { LoadingSpinner } from './LoadingSpinner';
import { speakText } from '../services/speechService';

export const InterviewPage = ({
  questions,
  currentQuestion,
  interviewStarted,
  isRecording,
  currentAnswer,
  setCurrentAnswer,
  pauseCount,
  stressLevel,
  postureWarnings,
  videoRef,
  voiceMode,
  onStartRecording,
  onStopRecording,
  onSubmitAnswer,
  onEndInterview,
  isLoading,
  isAnalyzing
}) => {
  useEffect(() => {
    if (interviewStarted && voiceMode && questions[currentQuestion]) {
      const timer = setTimeout(() => {
        speakText(questions[currentQuestion].question);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [interviewStarted, currentQuestion, voiceMode, questions]);

  if (!questions.length) {
    return <LoadingSpinner message="Loading interview questions..." />;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">
                Question {currentQuestion + 1}/{questions.length}
              </span>
            <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-white">Stress: {Math.round(stressLevel)}%</span>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <span className="text-white">Posture Warnings: {postureWarnings.length}</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to end the interview?')) {
                onEndInterview();
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-all"
          >
            <StopCircle className="w-5 h-5" />
            End Interview
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
            <CameraView 
              videoRef={videoRef} 
              postureWarnings={postureWarnings}
              isReady={true}  // You can pass the actual isReady state from useCamera hook
            />
          </div>

          {/* Question & Answer */}
          <div className="lg:col-span-2">
            <QuestionCard
              question={questions[currentQuestion]}
              questionNumber={currentQuestion + 1}
              totalQuestions={questions.length}
            />

            {interviewStarted && (
              <AnswerInput
                answer={currentAnswer}
                setAnswer={setCurrentAnswer}
                isRecording={isRecording}
                pauseCount={pauseCount}
                onStartRecording={onStartRecording}
                onStopRecording={onStopRecording}
                onSubmit={onSubmitAnswer}
                isLastQuestion={currentQuestion === questions.length - 1}
              />
            )}
          </div>
        </div>
      </div>

      {isLoading && <LoadingSpinner message="Preparing your interview..." />}
      {isAnalyzing && (
        <LoadingSpinner message="Analyzing your performance... This may take a moment" />
      )}
    </div>
  );
};