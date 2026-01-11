import React, { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { InterviewPage } from './components/InterviewPage';
import { ResultsPage } from './components/ResultsPage';
import { LoginPage } from './components/LoginPage';
import { useCamera } from './hooks/useCamera';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { usePoseDetection } from './hooks/usePoseDetection';
import { generateQuestions, analyzeInterview } from './services/geminiApi';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [page, setPage] = useState('home'); 
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [voiceMode, setVoiceMode] = useState(true);
  
  // STATE
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { videoRef, startCamera, stopCamera, startRecording: startVideoRecording, stopRecording: stopVideoRecording } = useCamera();
  const { isRecording: isVoiceRecording, transcript, pauseCount, startRecording: startVoice, stopRecording: stopVoice, resetTranscript } = useVoiceRecognition();
  const { stressLevel, startAnalysis, stopAnalysis } = useAudioAnalysis();
  const { postureWarnings, initialize: initPoseDetection, startDetection, stopDetection, resetWarnings } = usePoseDetection();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync transcript to answer box
  useEffect(() => {
    if (transcript) setCurrentAnswer(transcript);
  }, [transcript]);

  const handleLogout = () => signOut(auth);

  const handleStartInterview = async () => {
    setPage('interview');
    setIsLoading(true);
    
    // Questions are generated here (Count is set in geminiApi.js)
    const generatedQuestions = await generateQuestions(selectedProfile);
    setQuestions(generatedQuestions);
    
    await initPoseDetection();
    setIsLoading(false);
  };

  const handleStartRecording = async () => {
    try {
      if (!currentAnswer) resetTranscript(); // Clear old text
      await startVoice(); 
      try { await startAnalysis(); } catch (e) { console.warn(e); }
      if (videoRef.current && videoRef.current.srcObject) startVideoRecording();
    } catch (err) { console.error(err); }
  };

  const handleStopRecording = () => { 
    stopVoice(); 
    stopAnalysis(); 
    stopVideoRecording(); 
  };

  // --- FIXED: Submit Logic (Prevents Skipping) ---
  const handleSubmitAnswer = () => {
    handleStopRecording();
    
    // If you say nothing, we save this text so the AI knows you were silent
    const finalAnswerText = currentAnswer || transcript || "[No answer provided]";
    
    const answerData = {
      question: questions[currentQuestion]?.question,
      answer: finalAnswerText,
      pausesDuring: pauseCount,
      timestamp: Date.now()
    };
    
    // Update answers list
    const newAnswersList = [...answers, answerData];
    setAnswers(newAnswersList);

    // Navigation Logic
    if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        resetTranscript();
        setCurrentAnswer('');
    } else {
        handleEndInterview(newAnswersList);
    }
  };

  const handleEndInterview = async (finalAnswers = answers) => {
    setIsAnalyzing(true);
    stopCamera();
    stopDetection();
    handleStopRecording();

    try {
      const metrics = {
        totalPauses: finalAnswers.reduce((sum, a) => sum + (a.pausesDuring || 0), 0),
        postureWarnings: postureWarnings.length,
        avgStressLevel: stressLevel || 50
      };

      const analysis = await analyzeInterview(finalAnswers, selectedProfile, metrics);
      setFeedback(analysis);
      setPage('results');
    } catch (error) {
      console.error(error);
      setPage('results');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    setPage('home');
    setSelectedProfile(null);
    setCurrentQuestion(0);
    setQuestions([]);
    setAnswers([]);
    setCurrentAnswer('');
    setFeedback(null);
    resetTranscript();
    resetWarnings();
  };

  if (authLoading) return <div>Loading...</div>;
  if (!user) return <LoginPage />;

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
          isRecording={isVoiceRecording} 
          currentAnswer={currentAnswer}
          setCurrentAnswer={setCurrentAnswer}
          stressLevel={stressLevel}
          postureWarnings={postureWarnings}
          videoRef={videoRef}
          startCamera={startCamera}
          startDetection={startDetection}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onSubmitAnswer={handleSubmitAnswer}
          onEndInterview={() => handleEndInterview(answers)}
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