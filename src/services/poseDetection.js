let poseNet = null;
let detectionInterval = null;
let lastWarningTime = 0;
const WARNING_COOLDOWN_MS = 2000; 

export const initializePoseNet = async () => {
  try {
    console.log("🚀 Initializing PoseNet...");
    if (window.posenet) {
      poseNet = await window.posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75
      });
      console.log("✅ PoseNet Model Loaded Successfully");
      return poseNet;
    } else {
      console.error("❌ window.posenet is undefined. Check index.html script tags!");
      return null;
    }
  } catch (error) {
    console.error('❌ PoseNet initialization error:', error);
    return null;
  }
};

export const startPoseDetection = (videoElement, onPoseDetected) => {
  if (!poseNet || !videoElement) return;

  // Clear existing interval
  if (detectionInterval) clearInterval(detectionInterval);

  console.log("🔄 Starting Detection Loop...");

  const detectPose = async () => {
    // Check if video is ready
    if (videoElement.readyState >= 2) {
      try {
        const pose = await poseNet.estimateSinglePose(videoElement, {
          flipHorizontal: false
        });
        onPoseDetected(pose);
      } catch (error) {
        console.error("Pose detection error:", error);
      }
    }
  };

  detectionInterval = setInterval(detectPose, 500); 
};

export const stopPoseDetection = () => {
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
    console.log("🛑 Detection Stopped");
  }
};

export const analyzePosture = (pose) => {
  if (!pose || !pose.keypoints) return null;

  // --- DEBUG LOG: FORCE PRINT EVERYTHING ---
  // This will tell us if the AI is blind or just strict
  // console.log(`👁️ Raw Pose Score: ${pose.score.toFixed(2)}`);

  // 1. Confidence Check
  // Dropped to 0.1 (extremely low) just to get it working
  if (pose.score < 0.1) return null; 

  const leftShoulder = pose.keypoints.find(kp => kp.part === 'leftShoulder');
  const rightShoulder = pose.keypoints.find(kp => kp.part === 'rightShoulder');
  const nose = pose.keypoints.find(kp => kp.part === 'nose');

  if (!leftShoulder || !rightShoulder || !nose) return null;
  
  // 2. Metric Calculations
  const shoulderWidth = Math.abs(leftShoulder.position.x - rightShoulder.position.x);
  const avgShoulderY = (leftShoulder.position.y + rightShoulder.position.y) / 2;
  const neckLength = Math.abs(avgShoulderY - nose.position.y);
  
  // Filter noise
  if (shoulderWidth < 30) return null;

  const ratio = neckLength / shoulderWidth;

  // console.log(`📏 Ratio: ${ratio.toFixed(2)} | Shoulders: ${Math.round(shoulderWidth)}px`); 

  const warnings = [];
  const now = Date.now();

  // CHECK 1: SLOUCHING (Threshold 0.55)
  if (ratio < 0.55) { 
    if (now - lastWarningTime > WARNING_COOLDOWN_MS) {
       console.log(`⚠️ SLOUCH WARNING! (${ratio.toFixed(2)})`);
       warnings.push({ time: now, type: 'Sit Up Straight' });
       lastWarningTime = now;
    }
  }

  // CHECK 2: SHOULDER TILT
  const shoulderTilt = Math.abs(leftShoulder.position.y - rightShoulder.position.y);
  if (shoulderTilt > (shoulderWidth * 0.20)) {
    if (now - lastWarningTime > WARNING_COOLDOWN_MS) {
       console.log("⚠️ TILT WARNING!");
       warnings.push({ time: now, type: 'Fix Shoulder Level' });
       lastWarningTime = now;
    }
  }

  return warnings.length > 0 ? warnings : null;
};