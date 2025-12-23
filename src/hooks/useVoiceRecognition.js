import { useState, useRef, useCallback, useEffect } from 'react';
import { INTERVIEW_SETTINGS } from '../utils/constants';

export const useVoiceRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pauseCount, setPauseCount] = useState(0);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const startRecording = useCallback(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const errorMsg = 'Voice recognition not supported in your browser. Please use Chrome, Edge, or Safari.';
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      finalTranscriptRef.current = '';

      recognition.onstart = () => {
        console.log('Voice recognition started');
        setIsRecording(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += transcriptPiece + ' ';
            console.log('Final transcript:', transcriptPiece);
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        // Update transcript with both final and interim results
        const fullTranscript = finalTranscriptRef.current + interimTranscript;
        setTranscript(fullTranscript);

        // Detect pauses
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (finalTranscriptRef.current.length > 0) {
            setPauseCount(prev => prev + 1);
            console.log('Pause detected');
          }
        }, INTERVIEW_SETTINGS.SILENCE_THRESHOLD);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          console.log('No speech detected');
          setPauseCount(prev => prev + 1);
        } else if (event.error === 'audio-capture') {
          setError('Microphone not found. Please check your microphone.');
          alert('Microphone not found. Please check your microphone connection.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone permissions.');
          alert('Microphone access denied. Please allow microphone permissions in your browser settings.');
        } else {
          setError(`Voice recognition error: ${event.error}`);
        }
        
        // Don't stop on no-speech error, let it continue
        if (event.error !== 'no-speech') {
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        
        // Auto-restart if still recording (unless manually stopped)
        if (isRecording && recognitionRef.current) {
          console.log('Auto-restarting recognition...');
          try {
            recognition.start();
          } catch (err) {
            console.error('Error restarting recognition:', err);
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Failed to start voice recognition');
      alert('Failed to start voice recognition. Please try again.');
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    clearTimeout(silenceTimerRef.current);
    setIsRecording(false);
    console.log('Recording stopped. Final transcript:', finalTranscriptRef.current);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setPauseCount(0);
    finalTranscriptRef.current = '';
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearTimeout(silenceTimerRef.current);
    };
  }, []);

  return {
    isRecording,
    transcript,
    pauseCount,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
    setTranscript
  };
};