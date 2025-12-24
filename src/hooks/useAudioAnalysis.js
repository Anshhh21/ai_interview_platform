import { useState, useRef, useCallback } from 'react';

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
      analyser.fftSize = 256; // Smaller FFT is faster
      
      microphone.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const analyzeAudio = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate volume (RMS)
        let sum = 0;
        for(let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const averageVolume = sum / dataArray.length;
        
        // Normalize: 0-255 -> 0-100 scale
        // Normal speech usually sits around 30-50 volume. 
        // We map volume directly to "Excitement/Stress" for this demo.
        let rawStress = (averageVolume / 128) * 100;
        
        // Clamp between 5 and 100 to avoid flickering 0
        rawStress = Math.min(100, Math.max(5, rawStress));

        // Smooth the transition so it doesn't jump instantly
        setStressLevel(prev => (prev * 0.9) + (rawStress * 0.1));

        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      };

      analyzeAudio();
    } catch (err) {
      console.error('Audio analysis error:', err);
    }
  }, []);

const stopAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    // Added safety check here:
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  }, []);

  return { stressLevel, startAnalysis, stopAnalysis };
};