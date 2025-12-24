import { useRef, useCallback, useState } from 'react';

export const useCamera = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);

  const startCamera = useCallback(async () => {
    // 1. If stream already exists, just re-attach it to the video element
    if (streamRef.current) {
      if (videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play().catch(e => console.error("Play error:", e));
      }
      return streamRef.current;
    }

    try {
      // 2. Request permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      streamRef.current = stream;

      // 3. Attach to video element if it exists
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      return stream;
    } catch (err) {
      console.error("Camera Access Error:", err);
      return null;
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    
    chunksRef.current = []; // Reset chunks
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedVideoBlob(blob);
      console.log("Recording finished, blob size:", blob.size);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  return { 
    videoRef, 
    startCamera, 
    stopCamera,
    startRecording,
    stopRecording,
    recordedVideoBlob 
  };
};