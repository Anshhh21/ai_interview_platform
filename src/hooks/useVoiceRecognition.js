import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pauseCount, setPauseCount] = useState(0);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const isExplicitlyStopped = useRef(false);

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
        setError(null);
      };

      // Fix 5: Clean Result Handling
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => (prev + ' ' + finalTranscript).trim());
          setPauseCount(prev => prev + 1); 
        }
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

  const resetTranscript = useCallback(() => setTranscript(''), []);

  return { isRecording, transcript, pauseCount, startRecording, stopRecording, resetTranscript, error };
};