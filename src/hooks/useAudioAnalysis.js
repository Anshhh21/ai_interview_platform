import { useState, useRef, useCallback } from 'react';
import { INTERVIEW_SETTINGS } from '../utils/constants';

export const useAudioAnalysis = () => {
  const [stressLevel, setStressLevel] = useState(0);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const analyzeAudio = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const variance = dataArray.reduce((sum, val) => 
          sum + Math.pow(val - average, 2), 0
        ) / dataArray.length;
        
        // Higher variance indicates stress/nervousness
        const stressScore = Math.min(100, (variance / 10));
        setStressLevel(prev => (prev * 0.7 + stressScore * 0.3)); // Smooth the value

        animationFrameRef.current = setTimeout(analyzeAudio, INTERVIEW_SETTINGS.AUDIO_ANALYSIS_INTERVAL);
      };

      analyzeAudio();
    } catch (err) {
      console.error('Audio analysis error:', err);
    }
  }, []);

  const stopAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      clearTimeout(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }, []);

  return { stressLevel, startAnalysis, stopAnalysis };
};