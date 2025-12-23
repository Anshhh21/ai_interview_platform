import { useState, useEffect, useRef } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      setStream(mediaStream);
      
      // Wait for video element to be ready
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setIsReady(true);
            console.log('Camera started successfully');
          }).catch(err => {
            console.error('Error playing video:', err);
            setError('Failed to play video');
          });
        };
      }
      
      return mediaStream;
    } catch (err) {
      console.error('Camera error:', err);
      setError('Please allow camera and microphone access');
      alert('Camera access denied. Please allow camera and microphone permissions.');
      throw err;
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setStream(null);
      setIsReady(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return { stream, error, isReady, videoRef, startCamera, stopCamera };
};
