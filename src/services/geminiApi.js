const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
import { extractJSON, extractJSONArray } from '../utils/helpers';

// USE THIS EXACT URL. It is the standard stable version.
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Generate interview questions
export const generateQuestions = async (profile) => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate 5 technical interview questions for a ${profile.name} position. 
            Focus on: ${profile.topics.join(', ')}.
            Format: Return ONLY a JSON array of objects with "question" and "difficulty" (easy/medium/hard) fields.
            Example: [{"question": "What is...", "difficulty": "medium"}]`
          }]
        }]
      })
    });

    if (!response.ok) {
       // Log the actual error text from Google for easier debugging
       const errorBody = await response.text();
       throw new Error(`Gemini API Error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const questionsData = extractJSONArray(text);
    
    if (questionsData && questionsData.length > 0) {
      return questionsData;
    }
    
    return getFallbackQuestions(profile);
  } catch (error) {
    console.error('Error generating questions (using fallback):', error);
    return getFallbackQuestions(profile);
  }
};

// Analyze interview performance
// ... existing imports ...

// REPLACE THE REAL FUNCTION WITH THIS MOCK VERSION
export const analyzeInterview = async (answers, profile, metrics) => {
  console.log("⚠️ MOCK MODE ACTIVATED: Skipping Gemini API to test UI flow.");

  // 1. Simulate a 2-second network delay (so you see the loading spinner)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 2. Return fake, realistic data
  return {
    overallScore: 78,
    technicalSkills: {
      score: 75,
      feedback: "Good grasp of React fundamentals, but missed some depth on backend concepts.",
      weakAreas: ["System Design", "Database Indexing"]
    },
    communication: {
      score: 85,
      feedback: "Clear enunciation and good pacing. Very easy to understand."
    },
    confidence: {
      score: 80,
      feedback: "Maintained good posture and spoke with authority."
    },
    postureScore: Math.max(0, 100 - (metrics.postureWarnings * 5)),
    stressScore: Math.max(0, 100 - Math.round(metrics.avgStressLevel)),
    improvements: [
      "Elaborate more on 'Why' questions",
      "Don't rush through technical definitions",
      "Maintain eye contact with the camera"
    ],
    strengths: [
      "Great introduction",
      "Solid understanding of frontend state management",
      "Calm demeanor"
    ],
    // Pass through the real metrics you captured
    totalPauses: metrics.totalPauses,
    postureWarnings: metrics.postureWarnings,
    avgStressLevel: metrics.avgStressLevel
  };
};

// ... keep generateQuestions and fallback functions as they are ...

// --- Fallback Functions (Keep these exactly as they were) ---
const getIncompleteInterviewAnalysis = (metrics) => ({ overallScore: 0, ...metrics });
const getLowScoreAnalysis = (answers, metrics) => ({ overallScore: 30, ...metrics });
const getDefaultAnalysis = (answers, metrics) => ({ overallScore: 50, ...metrics });

const getFallbackQuestions = (profile) => {
  const questionBank = {
    frontend: [
      { question: "Explain the difference between var, let, and const.", difficulty: "easy" },
      { question: "What is the virtual DOM in React?", difficulty: "medium" },
      { question: "How do you optimize React performance?", difficulty: "hard" },
      { question: "Explain CSS Flexbox vs Grid.", difficulty: "medium" },
      { question: "What are React hooks?", difficulty: "medium" }
    ],
    // Add other profiles if needed or just default to frontend
  };
  return questionBank[profile.id] || questionBank.frontend;
};