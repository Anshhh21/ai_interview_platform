const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
import { extractJSON, extractJSONArray } from '../utils/helpers';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const questionsData = extractJSONArray(text);
    
    if (questionsData && questionsData.length > 0) {
      return questionsData;
    }
    
    // Fallback questions
    return getFallbackQuestions(profile);
  } catch (error) {
    console.error('Error generating questions:', error);
    return getFallbackQuestions(profile);
  }
};

// Analyze interview performance
export const analyzeInterview = async (answers, profile, metrics) => {
  // CRITICAL FIX: Check if interview was actually completed
  if (!answers || answers.length === 0) {
    return getIncompleteInterviewAnalysis(metrics);
  }

  // Check if answers are empty or too short
  const hasValidAnswers = answers.some(a => a.answer && a.answer.trim().length > 10);
  if (!hasValidAnswers) {
    return getLowScoreAnalysis(answers, metrics);
  }

  try {
    const answersText = answers.map((a, i) => 
      `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer || 'No answer provided'}\n`
    ).join('\n');

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this ${profile.name} interview performance. BE STRICT in scoring.
            If answers are empty, incomplete, or show lack of knowledge, give LOW scores (20-40).
            
            Provide feedback in JSON format with these exact fields:
            {
              "overallScore": number (0-100),
              "technicalSkills": {"score": number, "feedback": string, "weakAreas": [string]},
              "communication": {"score": number, "feedback": string},
              "confidence": {"score": number, "feedback": string},
              "improvements": [string],
              "strengths": [string]
            }
            
            Interview:
            ${answersText}
            
            Additional context:
            - Total Pauses: ${metrics.totalPauses}
            - Posture warnings: ${metrics.postureWarnings}
            - Average stress level: ${Math.round(metrics.avgStressLevel)}/100
            - Answers completed: ${answers.length}/5`
          }]
        }]
      })
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const analysis = extractJSON(text);

    if (analysis) {
      return {
        ...analysis,
        postureScore: Math.max(0, 100 - (metrics.postureWarnings * 10)),
        stressScore: Math.max(0, 100 - Math.round(metrics.avgStressLevel)),
        ...metrics
      };
    }

    return getDefaultAnalysis(answers, metrics);
  } catch (error) {
    console.error('Analysis error:', error);
    return getDefaultAnalysis(answers, metrics);
  }
};

// CRITICAL: Analysis for incomplete interviews
const getIncompleteInterviewAnalysis = (metrics) => {
  return {
    overallScore: 10,
    technicalSkills: { 
      score: 10, 
      feedback: "Interview not completed. No answers were provided.", 
      weakAreas: ["Complete the interview", "Provide detailed answers"] 
    },
    communication: { 
      score: 10, 
      feedback: "Unable to assess - no responses recorded" 
    },
    confidence: { 
      score: 10, 
      feedback: "Unable to assess - interview incomplete" 
    },
    improvements: [
      "Complete all interview questions",
      "Provide detailed answers to each question",
      "Practice speaking clearly into the microphone"
    ],
    strengths: [],
    postureScore: Math.max(0, 100 - (metrics.postureWarnings * 10)),
    stressScore: Math.max(0, 100 - Math.round(metrics.avgStressLevel)),
    ...metrics
  };
};

// CRITICAL: Low score for empty/poor answers
const getLowScoreAnalysis = (answers, metrics) => {
  const answeredCount = answers.filter(a => a.answer && a.answer.trim().length > 10).length;
  const baseScore = Math.min(40, answeredCount * 8); // Max 40 if all 5 answered poorly

  return {
    overallScore: baseScore,
    technicalSkills: { 
      score: baseScore - 10, 
      feedback: "Answers were too brief or incomplete. More detail needed.", 
      weakAreas: ["Provide comprehensive answers", "Demonstrate technical knowledge", "Explain concepts clearly"] 
    },
    communication: { 
      score: baseScore, 
      feedback: "Limited communication observed. Try to elaborate more on your answers." 
    },
    confidence: { 
      score: baseScore - 5, 
      feedback: "More confidence needed. Take time to think and provide complete answers." 
    },
    improvements: [
      "Provide longer, more detailed answers (aim for 30+ seconds per answer)",
      "Practice technical concepts before the interview",
      "Speak clearly and avoid very short responses",
      `Only ${answeredCount} out of ${answers.length} questions had substantial answers`
    ],
    strengths: answeredCount > 0 ? ["Attempted the interview"] : [],
    postureScore: Math.max(0, 100 - (metrics.postureWarnings * 10)),
    stressScore: Math.max(0, 100 - Math.round(metrics.avgStressLevel)),
    ...metrics
  };
};

// Default analysis with realistic scores
const getDefaultAnalysis = (answers, metrics) => {
  const answeredCount = answers.filter(a => a.answer && a.answer.trim().length > 10).length;
  const completionRate = (answeredCount / 5) * 100;
  const baseScore = Math.round(completionRate * 0.6); // 60% weight on completion

  return {
    overallScore: Math.min(75, baseScore + 15),
    technicalSkills: { 
      score: Math.min(70, baseScore + 10), 
      feedback: "Unable to fully assess technical skills from the responses provided", 
      weakAreas: ["Provide more detailed technical answers", "Practice complex scenarios"] 
    },
    communication: { 
      score: Math.min(75, baseScore + 15), 
      feedback: "Communication assessment limited by response quality" 
    },
    confidence: { 
      score: Math.min(70, baseScore + 10), 
      feedback: "Confidence level difficult to determine from brief responses" 
    },
    improvements: [
      "Provide longer, more comprehensive answers",
      "Practice more technical interview questions",
      answeredCount < 5 ? `Complete all 5 questions (only ${answeredCount} answered)` : "Great job completing all questions"
    ],
    strengths: answeredCount > 0 ? ["Participated in the interview"] : [],
    postureScore: Math.max(0, 100 - (metrics.postureWarnings * 10)),
    stressScore: Math.max(0, 100 - Math.round(metrics.avgStressLevel)),
    ...metrics
  };
};

// Fallback questions remain the same...
const getFallbackQuestions = (profile) => {
  const questionBank = {
    frontend: [
      { question: "Explain the difference between var, let, and const in JavaScript.", difficulty: "easy" },
      { question: "What is the virtual DOM in React and how does it work?", difficulty: "medium" },
      { question: "How would you optimize the performance of a React application?", difficulty: "hard" },
      { question: "Explain CSS Flexbox and Grid layout systems.", difficulty: "medium" },
      { question: "What are React hooks and why were they introduced?", difficulty: "medium" }
    ],
    backend: [
      { question: "What is the difference between SQL and NoSQL databases?", difficulty: "easy" },
      { question: "Explain RESTful API design principles.", difficulty: "medium" },
      { question: "How do you handle authentication and authorization?", difficulty: "medium" },
      { question: "What is database indexing and why is it important?", difficulty: "hard" },
      { question: "Explain microservices architecture and its benefits.", difficulty: "hard" }
    ],
    fullstack: [
      { question: "Describe your experience with full-stack development.", difficulty: "easy" },
      { question: "How do you approach system design for a web application?", difficulty: "hard" },
      { question: "Explain the client-server architecture.", difficulty: "medium" },
      { question: "How do you ensure security across the full stack?", difficulty: "hard" },
      { question: "What is your deployment and CI/CD process?", difficulty: "medium" }
    ],
    mobile: [
      { question: "What is the difference between React Native and native development?", difficulty: "easy" },
      { question: "How do you handle offline functionality in mobile apps?", difficulty: "medium" },
      { question: "Explain mobile app performance optimization techniques.", difficulty: "hard" },
      { question: "How do you manage state in React Native applications?", difficulty: "medium" },
      { question: "What is your approach to mobile UI/UX design?", difficulty: "medium" }
    ]
  };

  return questionBank[profile.id] || questionBank.frontend;
};