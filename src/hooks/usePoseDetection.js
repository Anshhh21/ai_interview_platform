import { useState, useCallback } from 'react';
import { initializePoseNet, startPoseDetection, stopPoseDetection, analyzePosture } from '../services/poseDetection';

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
        setPostureWarnings(prev => {
           // BUG FIX: Removed .slice(-5). 
           // We store all warnings so the final score is accurate.
           return [...prev, ...warnings];
        });
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