export const jobProfiles = [
    { 
      id: 'frontend', 
      name: 'Frontend Developer', 
      color: 'bg-blue-500', 
      topics: ['HTML/CSS', 'JavaScript', 'React', 'Performance'] 
    },
    { 
      id: 'backend', 
      name: 'Backend Developer', 
      color: 'bg-green-500', 
      topics: ['APIs', 'Databases', 'Security', 'Architecture'] 
    },
    { 
      id: 'fullstack', 
      name: 'Full Stack Developer', 
      color: 'bg-purple-500', 
      topics: ['Frontend', 'Backend', 'DevOps', 'System Design'] 
    },
    { 
      id: 'mobile', 
      name: 'App Developer', 
      color: 'bg-orange-500', 
      topics: ['Mobile UI', 'React Native', 'Performance', 'APIs'] 
    }
  ];
  
  export const INTERVIEW_SETTINGS = {
    QUESTION_COUNT: 5,
    POSE_DETECTION_INTERVAL: 2000,
    AUDIO_ANALYSIS_INTERVAL: 500,
    SILENCE_THRESHOLD: 2000,
    POSTURE_THRESHOLD: 100,
    SHOULDER_ALIGNMENT_THRESHOLD: 50
  };