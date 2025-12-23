import { INTERVIEW_SETTINGS } from '../utils/constants';

let poseNet = null;
let detectionInterval = null;

// Initialize PoseNet
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

// Start pose detection
export const startPoseDetection = (videoElement, onPoseDetected) => {
  if (!poseNet || !videoElement) return;

  const detectPose = async () => {
    if (videoElement.readyState === 4) {
      try {
        const pose = await poseNet.estimateSinglePose(videoElement, {
          flipHorizontal: false
        });
        onPoseDetected(pose);
      } catch (error) {
        console.error('Pose detection error:', error);
      }
    }
  };

  detectionInterval = setInterval(detectPose, INTERVIEW_SETTINGS.POSE_DETECTION_INTERVAL);
};

// Stop pose detection
export const stopPoseDetection = () => {
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
};

// Analyze posture from pose
export const analyzePosture = (pose) => {
  if (!pose || !pose.keypoints) return null;

  const nose = pose.keypoints.find(kp => kp.part === 'nose');
  const leftShoulder = pose.keypoints.find(kp => kp.part === 'leftShoulder');
  const rightShoulder = pose.keypoints.find(kp => kp.part === 'rightShoulder');

  if (!nose || !leftShoulder || !rightShoulder) return null;

  const warnings = [];

  // Check if leaning too far forward/back
  const shoulderMidY = (leftShoulder.position.y + rightShoulder.position.y) / 2;
  const postureDiff = Math.abs(nose.position.y - shoulderMidY);

  if (postureDiff > INTERVIEW_SETTINGS.POSTURE_THRESHOLD) {
    warnings.push({
      time: Date.now(),
      type: 'Poor posture detected - sit upright'
    });
  }

  // Check shoulder alignment
  const shoulderDiff = Math.abs(leftShoulder.position.y - rightShoulder.position.y);
  if (shoulderDiff > INTERVIEW_SETTINGS.SHOULDER_ALIGNMENT_THRESHOLD) {
    warnings.push({
      time: Date.now(),
      type: 'Uneven shoulder alignment'
    });
  }

  return warnings.length > 0 ? warnings : null;
};