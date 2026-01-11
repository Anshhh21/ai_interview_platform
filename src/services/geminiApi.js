const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
import { extractJSON, extractJSONArray } from '../utils/helpers';

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.3-70b-versatile"; 

const callGroq = async (systemPrompt, userPrompt) => {
  try {
    if (!GROQ_API_KEY) throw new Error("Missing VITE_GROQ_API_KEY in .env");

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }, 
        temperature: 0.6,
        max_tokens: 1024
      })
    });

    if (!response.ok) throw new Error(`Groq API Error ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("Groq Call Failed:", error);
    return null;
  }
};

export const generateQuestions = async (profile) => {
  try {
    const systemPrompt = `You are a helpful technical recruiter. 
    Output purely in JSON. 
    Return a key "questions" which is an array of objects.`;
    
    // CHANGED: Explicitly ask for 3 questions
    const userPrompt = `Generate 3 interview questions for a ${profile.name} role. 
    Focus on: ${profile.topics.join(', ')}.
    Return ONLY JSON: { "questions": [{ "question": "string", "difficulty": "easy|medium|hard" }] }`;

    const jsonString = await callGroq(systemPrompt, userPrompt);
    const parsed = extractJSON(jsonString);
    return parsed?.questions || extractJSONArray(jsonString) || getFallbackQuestions(profile);

  } catch (error) {
    return getFallbackQuestions(profile);
  }
};

export const analyzeInterview = async (answers, profile, metrics) => {
  // 1. MATH OPTIMIZATIONS
  // Posture: Deduct 5 points per warning, floor at 0, round it.
  const calculatedPostureScore = Math.max(0, Math.round(100 - (metrics.postureWarnings * 5)));
  
  // Stress: 100 - raw stress. If stress is 5, Score is 95 (Composure).
  const rawStress = metrics.avgStressLevel || 0;
  const calculatedComposureScore = Math.max(50, Math.round(100 - rawStress));

  try {
    // 2. AI PROMPT OPTIMIZATION
    const systemPrompt = `You are a supportive career coach. 
    Analyze the candidate's answers. Be constructive and encouraging.
    - If the answer is "[No answer provided]", give a score of 0 for technical skills but be helpful in feedback.
    - Do NOT hallucinate posture scores.
    Output ONLY valid JSON.`;

    const userPrompt = `Role: ${profile.name}
    Transcript: ${JSON.stringify(answers.map(a => ({ Q: a.question, A: a.answer })))}
    
    Return JSON:
    {
      "technicalSkills": {"score": 0-100, "feedback": "string", "weakAreas": ["string"]},
      "communication": {"score": 0-100, "feedback": "string"},
      "confidence": {"score": 0-100, "feedback": "string"},
      "improvements": ["string"],
      "strengths": ["string"]
    }`;

    const jsonString = await callGroq(systemPrompt, userPrompt);
    const aiAnalysis = extractJSON(jsonString);

    if (!aiAnalysis) throw new Error("Failed to parse Groq JSON");

    // 3. WEIGHTED SCORE OPTIMIZATION
    const overallScore = Math.round(
      ((aiAnalysis.technicalSkills?.score || 70) * 0.35) + 
      ((aiAnalysis.communication?.score || 70) * 0.25) + 
      (calculatedPostureScore * 0.25) + 
      (calculatedComposureScore * 0.15)
    );

    return {
      overallScore,
      technicalSkills: aiAnalysis.technicalSkills,
      communication: aiAnalysis.communication,
      confidence: aiAnalysis.confidence,
      postureScore: calculatedPostureScore, 
      stressScore: calculatedComposureScore, 
      improvements: aiAnalysis.improvements || [],
      strengths: aiAnalysis.strengths || [],
      postureWarnings: metrics.postureWarnings,
      totalPauses: metrics.totalPauses
    };

  } catch (error) {
    console.error("AI Analysis failed. Using fallback:", error);
    return {
      overallScore: Math.round((70 * 0.6) + (calculatedPostureScore * 0.2) + (calculatedComposureScore * 0.2)),
      technicalSkills: { score: 75, feedback: "Good attempt. Keep practicing technical terms.", weakAreas: [] },
      communication: { score: 80, feedback: "Clear speech pace." },
      confidence: { score: 75, feedback: "Maintained flow well." },
      postureScore: calculatedPostureScore,
      stressScore: calculatedComposureScore,
      improvements: ["Check Internet Connection"],
      strengths: ["Completed Session", "Good Posture"],
      postureWarnings: metrics.postureWarnings,
      totalPauses: metrics.totalPauses
    };
  }
};

const getFallbackQuestions = (profile) => {
  // Fallback also limited to 3 questions
  const bank = {
    frontend: [
      { question: "What is the difference between state and props in React?", difficulty: "easy" },
      { question: "Explain the useEffect hook lifecycle.", difficulty: "medium" },
      { question: "What is the virtual DOM?", difficulty: "medium" },
    ],
    backend: [
      { question: "Explain RESTful API principles.", difficulty: "medium" },
      { question: "What is the difference between SQL and NoSQL?", difficulty: "easy" },
      { question: "How do you handle database transactions?", difficulty: "hard" },
    ]
  };
  return bank[profile?.id] || bank.frontend;
};