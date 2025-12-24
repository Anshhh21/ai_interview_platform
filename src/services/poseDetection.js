import { INTERVIEW_SETTINGS } from '../utils/constants'; // Ensure constants exist or remove this import

let poseNet = null;
let detectionInterval = null;

export const initializePoseNet = async () => {
  try {
    if (window.posenet) {
      poseNet = await window.posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75
      });
      return poseNet;
    }
    return null;
  } catch (error) {
    console.error('PoseNet initialization error:', error);
    return null;
  }
};

export const startPoseDetection = (videoElement, onPoseDetected) => {
  if (!poseNet || !videoElement) return;

  const detectPose = async () => {
    if (videoElement.readyState === 4 && !videoElement.paused) {
      try {
        const pose = await poseNet.estimateSinglePose(videoElement, {
          flipHorizontal: false
        });
        onPoseDetected(pose);
      } catch (error) {
        // limit logging
      }
    }
  };

  if (detectionInterval) clearInterval(detectionInterval);
  detectionInterval = setInterval(detectPose, 500); // Check every 500ms
};

export const stopPoseDetection = () => {
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
};

// services/poseDetection.js

export const analyzePosture = (pose) => {
  if (!pose || !pose.keypoints) return null;
  
  // Ignore low confidence frames (e.g., bad lighting)
  if (pose.score < 0.3) return null;

  const nose = pose.keypoints.find(kp => kp.part === 'nose');
  const leftShoulder = pose.keypoints.find(kp => kp.part === 'leftShoulder');
  const rightShoulder = pose.keypoints.find(kp => kp.part === 'rightShoulder');

  // If we can't see shoulders, don't guess
  if (!nose || !leftShoulder || !rightShoulder) return null;
  if (leftShoulder.score < 0.5 || rightShoulder.score < 0.5) return null;

  const warnings = [];

  // 1. Check Slouching (Neck Length)
  const avgShoulderY = (leftShoulder.position.y + rightShoulder.position.y) / 2;
  const neckLength = Math.abs(avgShoulderY - nose.position.y);

  // DEBUGGING: Uncomment this to see your numbers in the console!
  // console.log(`Neck Length: ${Math.round(neckLength)} (Threshold: 30)`);

  // OLD THRESHOLD: 50 (Too strict) -> NEW THRESHOLD: 25 (Forgiving)
  if (neckLength < 25) { 
    warnings.push({ time: Date.now(), type: 'Sit Up Straight' });
  }

  // 2. Check Tilt (Shoulder Alignment)
  const shoulderTilt = Math.abs(leftShoulder.position.y - rightShoulder.position.y);
  
  // OLD THRESHOLD: 40 -> NEW THRESHOLD: 50 (Allows natural movement)
  if (shoulderTilt > 50) {
    warnings.push({ time: Date.now(), type: 'Shoulders Uneven' });
  }

  return warnings.length > 0 ? warnings : null;
};