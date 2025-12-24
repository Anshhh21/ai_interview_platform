// hooks/useCamera.js
import { useRef, useCallback } from 'react';

export const useCamera = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null); // Keep track of the stream to stop it later

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      streamRef.current = stream;

      // Assign to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      console.error("Camera Access Error:", err);
    }
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  return { videoRef, startCamera, stopCamera };
};