import { useState, useCallback } from 'react';
// Make sure this path points to your service file correctly!
import { initializePoseNet, startPoseDetection, stopPoseDetection, analyzePosture } from '../services/poseDetection';

// CRITICAL: Must start with 'export const'
export const usePoseDetection = () => {
  const [postureWarnings, setPostureWarnings] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const initialize = useCallback(async () => {
    const net = await initializePoseNet();
    setIsInitialized(!!net);
    return !!net;
  }, []);

  const startDetection = useCallback((videoElement) => {
    startPoseDetection(videoElement, (pose) => {
      const warnings = analyzePosture(pose);
      if (warnings && warnings.length > 0) {
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