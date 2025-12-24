import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pauseCount, setPauseCount] = useState(0);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const isExplicitlyStopped = useRef(false);
  const retryCount = useRef(0); // Prevent infinite loops

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        isExplicitlyStopped.current = false;
        retryCount.current = 0; // Reset retries on success
        setError(null);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        
        // Simple pause detection based on silence between results
        setPauseCount(prev => prev + 1); 
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'network') {
          retryCount.current += 1;
          if (retryCount.current > 2) {
            setError("Network error: Voice recognition unavailable. Please type your answer.");
            recognition.stop();
            isExplicitlyStopped.current = true; // Force stop
            return;
          }
        }
      };

      recognition.onend = () => {
        if (!isExplicitlyStopped.current && !error && retryCount.current <= 2) {
           // Small delay before restarting to prevent CPU hogging
           setTimeout(() => {
             try { recognition.start(); } catch(e) {}
           }, 300);
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [error]);

  const startRecording = useCallback(() => {
    setTranscript('');
    setPauseCount(0);
    setError(null);
    isExplicitlyStopped.current = false;
    retryCount.current = 0;
    
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (e) { console.error(e); }
    }
  }, []);

  const stopRecording = useCallback(() => {
    isExplicitlyStopped.current = true;
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  }, []);

  const resetTranscript = useCallback(() => setTranscript(''), []);

  return { isRecording, transcript, pauseCount, startRecording, stopRecording, resetTranscript, error };
};