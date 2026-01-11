const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
import { extractJSON, extractJSONArray } from '../utils/helpers';

// CHANGED: Reverted to v1beta as it is more reliable for the 1.5-flash model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateQuestions = async (profile) => {
  try {
    if (!GEMINI_API_KEY) throw new Error("Missing Gemini API Key in .env file");

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate 5 technical interview questions for a ${profile.name} position. 
            Focus on: ${profile.topics.join(', ')}.
            Format: Return ONLY a JSON array of objects with "question" and "difficulty" (easy/medium/hard) fields.`
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return extractJSONArray(text) || getFallbackQuestions(profile);
  } catch (error) {
    console.error("Question generation failed:", error);
    return getFallbackQuestions(profile);
  }
};

export const analyzeInterview = async (answers, profile, metrics) => {
  try {
    if (!GEMINI_API_KEY) throw new Error("Missing Gemini API Key");

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this interview for a ${profile.name} role.
            Answers: ${JSON.stringify(answers)}
            Metrics: ${JSON.stringify(metrics)}
            
            Return ONLY a JSON object with this exact structure:
            {
              "overallScore": 0-100,
              "technicalSkills": {"score": 0-100, "feedback": "string", "weakAreas": []},
              "communication": {"score": 0-100, "feedback": "string"},
              "confidence": {"score": 0-100, "feedback": "string"},
              "postureScore": 0-100,
              "stressScore": 0-100,
              "improvements": [],
              "strengths": []
            }`
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const analysis = extractJSON(text);
    
    // Validate the analysis object has the required structure
    return {
      overallScore: analysis?.overallScore ?? 50,
      technicalSkills: analysis?.technicalSkills || { score: 50, feedback: "Analysis unavailable", weakAreas: [] },
      communication: analysis?.communication || { score: 50, feedback: "Analysis unavailable" },
      confidence: analysis?.confidence || { score: 50, feedback: "Analysis unavailable" },
      postureScore: analysis?.postureScore ?? 100,
      stressScore: analysis?.stressScore ?? 100,
      improvements: analysis?.improvements || [],
      strengths: analysis?.strengths || [],
      postureWarnings: metrics.postureWarnings,
      totalPauses: metrics.totalPauses
    };
  } catch (error) {
    console.error("AI Analysis failed. Using fallback data:", error);
    return {
      overallScore: 50,
      technicalSkills: { score: 50, feedback: "Check your API key and connection.", weakAreas: ["API Connection"] },
      communication: { score: 50, feedback: "Check your internet connection." },
      confidence: { score: 50, feedback: "Try again later." },
      postureScore: 100,
      stressScore: 100,
      improvements: ["Ensure VITE_GEMINI_API_KEY is correct", "Check browser console for 404/403 errors"],
      strengths: ["Session completed"],
      postureWarnings: metrics.postureWarnings,
      totalPauses: metrics.totalPauses
    };
  }
};

const getFallbackQuestions = (profile) => {
  const bank = {
    frontend: [
      { question: "What is React and why is it used?", difficulty: "easy" },
      { question: "Explain the concept of state in React.", difficulty: "medium" }
    ],
  };
  return bank[profile.id] || bank.frontend;
};