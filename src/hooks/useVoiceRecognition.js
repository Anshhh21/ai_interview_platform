import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pauseCount, setPauseCount] = useState(0);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const isExplicitlyStopped = useRef(false);
  
  // NEW: Store confirmed text safely so interim updates don't overwrite history
  const accumulatedTextRef = useRef(''); 

  useEffect(() => {
    // Browser compatibility check
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true; // CRITICAL: This allows real-time typing
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        isExplicitlyStopped.current = false;
        setError(null);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let newFinalTranscript = '';

        // Loop through results (both final and interim)
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            newFinalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // 1. If we have a completed sentence, add it to our permanent history
        if (newFinalTranscript) {
           accumulatedTextRef.current += ' ' + newFinalTranscript;
           setPauseCount(prev => prev + 1); 
        }

        // 2. Update the UI with: History + Current Live Words
        // This triggers the re-render immediately, making the UI feel "Live"
        // It also resets the Pause Timer in App.jsx instantly!
        setTranscript((accumulatedTextRef.current + ' ' + interimTranscript).trim());
      };

      recognition.onend = () => {
        if (!isExplicitlyStopped.current) {
           setTimeout(() => { try { recognition.start(); } catch(e) {} }, 300);
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startRecording = useCallback(() => {
    setTranscript('');
    setPauseCount(0);
    accumulatedTextRef.current = ''; // Reset history
    isExplicitlyStopped.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (e) {}
    }
  }, []);

  const stopRecording = useCallback(() => {
    isExplicitlyStopped.current = true;
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  }, []);

  const resetTranscript = useCallback(() => {
      setTranscript('');
      accumulatedTextRef.current = '';
  }, []);

  return { isRecording, transcript, pauseCount, startRecording, stopRecording, resetTranscript, error };
};