import React, { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { InterviewPage } from './components/InterviewPage';
import { ResultsPage } from './components/ResultsPage';
import { LoginPage } from './components/LoginPage';
import { useCamera } from './hooks/useCamera';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { usePoseDetection } from './hooks/usePoseDetection'; // Ensure this hook is exported correctly now!
import { generateQuestions, analyzeInterview } from './services/geminiApi';
import { auth, saveInterviewSession } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';

function App() {
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
  const { 
    videoRef, startCamera, stopCamera, 
    startRecording: startVideoRecording, 
    stopRecording: stopVideoRecording 
  } = useCamera();

  const { 
    isRecording: isVoiceRecording, transcript, pauseCount, 
    startRecording: startVoice, stopRecording: stopVoice, resetTranscript 
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

  useEffect(() => {
    if (transcript) setCurrentAnswer(transcript);
  }, [transcript]);

  const handleLogout = () => signOut(auth);

  const handleStartInterview = async () => {
    setPage('interview');
    setIsLoading(true);
    
    // 1. Generate Content
    const generatedQuestions = await generateQuestions(selectedProfile);
    setQuestions(generatedQuestions);
    
    // 2. Initialize PoseNet
    await initPoseDetection();
    
    // 3. Ready to render
    setIsLoading(false);
    setInterviewStarted(true);
  };

  // Triggers Voice, Audio Analysis, AND Video Recording
  const handleStartRecording = async () => {
    try {
      await startVoice(); 
      try {
        await startAnalysis();
      } catch (e) {
        console.warn("Audio analysis failed to start:", e);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        startVideoRecording();
      }
    } catch (err) {
      console.error("Failed to start recording session:", err);
    }
  };

  const handleStopRecording = () => { 
    stopVoice(); 
    stopAnalysis(); 
    stopVideoRecording(); 
  };

  const handleSubmitAnswer = () => {
    handleStopRecording();
    
    // 1. Save Answer
    const answerData = {
      question: questions[currentQuestion].question,
      answer: currentAnswer,
      pausesDuring: pauseCount,
      timestamp: Date.now()
    };
    
    // Use callback to ensure we have the latest state
    setAnswers(prev => {
        const newAnswers = [...prev, answerData];
        
        // 2. CHECK IF LAST QUESTION
        if (currentQuestion < questions.length - 1) {
            // Move to next
            setQuestions(prevQ => prevQ); 
            setCurrentQuestion(prev => prev + 1);
            resetTranscript();
            setCurrentAnswer('');
        } else {
            // 3. IF LAST QUESTION -> END INTERVIEW
            handleEndInterview(newAnswers);
        }
        return newAnswers;
    });
  };

  // --- FIXED END INTERVIEW FUNCTION ---
  const handleEndInterview = async (finalAnswers = answers) => {
    setIsAnalyzing(true);
    stopCamera();
    stopDetection();
    handleStopRecording();

    try {
      const answersToAnalyze = Array.isArray(finalAnswers) ? finalAnswers : answers;

      const metrics = {
        totalPauses: answersToAnalyze.reduce((sum, a) => sum + (a.pausesDuring || 0), 0),
        postureWarnings: postureWarnings.length,
        avgStressLevel: stressLevel
      };

      const analysis = await analyzeInterview(answersToAnalyze, selectedProfile, metrics);
      setFeedback(analysis);

      // if (user) {
      //   try {
      //     await saveInterviewSession({
      //       userId: user.uid,
      //       userEmail: user.email,
      //       profile: selectedProfile.name,
      //       answers: answersToAnalyze,
      //       feedback: analysis,
      //       metrics: metrics,
      //     });
      //   } catch (fbError) {
      //     console.error("Firebase save failed:", fbError);
      //   }
      // }
      setPage('results');
    } catch (error) {
      console.error("Critical error during interview end:", error);
      setPage('results');
    } finally {
      setIsAnalyzing(false);
    }
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

  if (authLoading) return <div className="loading">Checking security...</div>;
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
          interviewStarted={interviewStarted}
          isRecording={isVoiceRecording} 
          currentAnswer={currentAnswer}
          setCurrentAnswer={setCurrentAnswer}
          pauseCount={pauseCount}
          stressLevel={stressLevel}
          postureWarnings={postureWarnings}
          videoRef={videoRef}
          startCamera={startCamera}
          startDetection={startDetection}
          voiceMode={voiceMode}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onSubmitAnswer={handleSubmitAnswer}
          onEndInterview={() => handleEndInterview(answers)} // Pass current answers wrapper
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