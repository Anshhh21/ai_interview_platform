import React, { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { InterviewPage } from './components/InterviewPage';
import { ResultsPage } from './components/ResultsPage';
import { LoginPage } from './components/LoginPage'; // We will create this next
import { useCamera } from './hooks/useCamera';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { usePoseDetection } from './hooks/usePoseDetection';
import { generateQuestions, analyzeInterview } from './services/geminiApi';
import { auth, saveInterviewSession } from './services/firebase'; // Added 'auth'
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';

function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- INTERVIEW STATE ---
  const [page, setPage] = useState('home'); 
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [voiceMode, setVoiceMode] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- CUSTOM HOOKS ---
  const { videoRef, startCamera, stopCamera } = useCamera();
  const { 
    isRecording, transcript, pauseCount, 
    startRecording, stopRecording, resetTranscript 
  } = useVoiceRecognition();
  const { stressLevel, startAnalysis, stopAnalysis } = useAudioAnalysis();
  const { 
    postureWarnings, initialize: initPoseDetection, 
    startDetection, stopDetection, resetWarnings 
  } = usePoseDetection();

  // --- AUTH OBSERVER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Update current answer from voice transcript
  useEffect(() => {
    if (transcript) setCurrentAnswer(transcript);
  }, [transcript]);

  // --- HANDLERS ---
  const handleLogout = () => signOut(auth);

  const handleStartInterview = async () => {
    setPage('interview');
    setIsLoading(true);
    await startCamera();
    const generatedQuestions = await generateQuestions(selectedProfile);
    setQuestions(generatedQuestions);
    await initPoseDetection();
    setIsLoading(false);

    setTimeout(() => {
      setInterviewStarted(true);
      if (videoRef.current) startDetection(videoRef.current);
    }, 2000);
  };

  const handleStartRecording = () => { startRecording(); startAnalysis(); };
  const handleStopRecording = () => { stopRecording(); stopAnalysis(); };

  const handleSubmitAnswer = () => {
    handleStopRecording();
    const answerData = {
      question: questions[currentQuestion].question,
      answer: currentAnswer,
      pausesDuring: pauseCount,
      timestamp: Date.now()
    };
    setAnswers(prev => [...prev, answerData]);
    resetTranscript();
    setCurrentAnswer('');
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleEndInterview();
    }
  };

  const handleEndInterview = async () => {
    setIsAnalyzing(true);
    stopCamera();
    stopDetection();
    handleStopRecording();

    const metrics = {
      totalPauses: answers.reduce((sum, a) => sum + a.pausesDuring, 0) + pauseCount,
      postureWarnings: postureWarnings.length,
      avgStressLevel: stressLevel
    };

    const analysis = await analyzeInterview(answers, selectedProfile, metrics);
    setFeedback(analysis);

    try {
      await saveInterviewSession({
        userId: user.uid, // Track which user did this interview
        profile: selectedProfile.name,
        answers,
        feedback: analysis,
        metrics,
        completedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving interview:', error);
    }
    setPage('results');
    setIsAnalyzing(false);
  };

  const handleRestart = () => {
    setPage('home');
    setSelectedProfile(null);
    setInterviewStarted(false);
    setCurrentQuestion(0);
    setQuestions([]);
    setAnswers([]);
    setCurrentAnswer('');
    setFeedback(null);
    resetTranscript();
    resetWarnings();
  };

  // --- RENDER LOGIC ---

  if (authLoading) return <div className="loading">Checking security...</div>;

  // 1. If not logged in, show Login Screen
  if (!user) return <LoginPage />;

  // 2. If logged in, show Interview Platform
  return (
    <div className="App">
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f0f0f0' }}>
        <span>Logged in as: <b>{user.email}</b></span>
        <button onClick={handleLogout}>Logout</button>
      </header>

      {page === 'home' && (
        <HomePage
          selectedProfile={selectedProfile}
          setSelectedProfile={setSelectedProfile}
          voiceMode={voiceMode}
          setVoiceMode={setVoiceMode}
          onStartInterview={handleStartInterview}
        />
      )}

      {page === 'interview' && (
        <InterviewPage
          questions={questions}
          currentQuestion={currentQuestion}
          interviewStarted={interviewStarted}
          isRecording={isRecording}
          currentAnswer={currentAnswer}
          setCurrentAnswer={setCurrentAnswer}
          pauseCount={pauseCount}
          stressLevel={stressLevel}
          postureWarnings={postureWarnings}
          videoRef={videoRef}
          voiceMode={voiceMode}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onSubmitAnswer={handleSubmitAnswer}
          onEndInterview={handleEndInterview}
          isLoading={isLoading}
          isAnalyzing={isAnalyzing}
        />
      )}

      {page === 'results' && (
        <ResultsPage
          feedback={feedback}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;