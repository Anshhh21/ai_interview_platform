import { useState, useCallback } from 'react';
// This points to the service that handles the actual PoseNet logic
import { initializePoseNet, startPoseDetection, stopPoseDetection, analyzePosture } from '../services/poseDetection';

// This MUST be 'export const' to match the import in App.jsx
export const usePoseDetection = () => {
  const [postureWarnings, setPostureWarnings] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const initialize = useCallback(async () => {
    const net = await initializePoseNet();
    setIsInitialized(!!net);
    return !!net;
  }, []);

  const startDetection = useCallback((videoElement) => {
    if (!videoElement) return;
    
    startPoseDetection(videoElement, (pose) => {
      const warnings = analyzePosture(pose);
      if (warnings && warnings.length > 0) {
        // Keep only the most recent 5 warnings
        setPostureWarnings(prev => [...prev, ...warnings].slice(-5));
      }
    });
  }, []);

  const stopDetection = useCallback(() => {
    stopPoseDetection();
  }, []);

  const resetWarnings = useCallback(() => {
    setPostureWarnings([]);
  }, []);

  return {
    postureWarnings,
    isInitialized,
    initialize,
    startDetection,
    stopDetection,
    resetWarnings
  };
};