import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse json requests
app.use(express.json());

// Initialize Gemini client lazily/safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (aiClient) return aiClient;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI capabilities will be impaired.");
  }
  
  aiClient = new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  return aiClient;
}

// Support status endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV });
});

// API endpoint: 1. Journal Entry analysis
app.post("/api/analyze-journal", async (req, res) => {
  try {
    const { text, moodScore, profile } = req.body;
    if (!text || !moodScore) {
      return res.status(400).json({ error: "Missing text or moodScore" });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      // Fallback response when API Key is missing, to keep app functional in dev preview transitions
      const mockAnalysis = {
        emotion: moodScore <= 4 ? "Anxiety" : moodScore <= 7 ? "Stress" : "Confidence",
        stressScore: Math.max(1, Math.min(10, 11 - moodScore)),
        confidenceScore: moodScore,
        burnoutRisk: moodScore <= 3 ? "High" : moodScore <= 6 ? "Medium" : "Low",
        triggers: text.toLowerCase().includes("test") || text.toLowerCase().includes("exam") 
          ? ["Mock Test Anxiety"] 
          : text.toLowerCase().includes("fail") 
            ? ["Fear of Failure"] 
            : ["Time Management"],
        insights: "Self-reflection is key. This is a local simulation since GEMINI_API_KEY is not configured.",
        crisisFlagged: text.toLowerCase().includes("self-harm") || text.toLowerCase().includes("die") || text.toLowerCase().includes("suicide")
      };
      return res.json(mockAnalysis);
    }

    const examContext = profile ? `Preparing for ${profile.examType} exam.` : "";
    const studentNameContext = profile ? `Student name: ${profile.name}.` : "";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze this student journal entry. Input details:
Student Context: ${studentNameContext} ${examContext}
Logged Mood Score: ${moodScore}/10 (where 10 is wonderful, 1 is extremely down/anxious)
Journal text: "${text}"`,
      config: {
        systemInstruction: "You are MindOS AI, an expert clinical student-wellness counselor. Score student distress objectively, provide warm and reassuring guidance. Be brief, respectful, and clinically safe.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotion: {
              type: Type.STRING,
              description: "One dominating emotion: Anxiety, Stress, Confidence, Motivation, Frustration"
            },
            stressScore: {
              type: Type.INTEGER,
              description: "Index from 1 (peaceful) to 10 (severely overwhelmed/burnout)"
            },
            confidenceScore: {
              type: Type.INTEGER,
              description: "Assessed confidence from 1 (helpless) to 10 (determined/fully prepared)"
            },
            burnoutRisk: {
              type: Type.STRING,
              description: "Strictly select: Low, Medium, High"
            },
            triggers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List 1-3 stress triggers. Strongly prefer matching standard categories: Fear of Failure, Parent Pressure, Mock Test Anxiety, Time Management, Peer Comparison, or custom if unique"
            },
            insights: {
              type: Type.STRING,
              description: "Short, encouraging, warm advisory note (1-2 sentences) speaking to the student directly, offering a calm perspective."
            },
            crisisFlagged: {
              type: Type.BOOLEAN,
              description: "Set to TRUE if text explicitly signals immediate self-harm, suicidal ideation, severe clinical despair, or absolute panic distress; otherwise FALSE."
            }
          },
          required: [
            "emotion",
            "stressScore",
            "confidenceScore",
            "burnoutRisk",
            "triggers",
            "insights",
            "crisisFlagged"
          ]
        }
      }
    });

    const resultText = response.text || "{}";
    const analysis = JSON.parse(resultText);
    res.json(analysis);

  } catch (error: any) {
    console.error("Journal analysis error:", error);
    res.status(500).json({ error: "Failed to analyze journal entry: " + error.message });
  }
});

// API endpoint: 2. Discover Hidden Patterns & Triggers
app.post("/api/discover-triggers", async (req, res) => {
  try {
    const { entries, profile } = req.body;
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: "Invalid or empty entries list" });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        insightsOnTriggers: [
          "Pattern detected: Mentions of cramming appear correlated with a drop in self-reports.",
          "Consistency is good, but stress spikes during late evening hours.",
          "Anxiety spikes mostly refer to exam preparations."
        ],
        rebuildingStrategy: "Define strict boundary hours between mock exams and wind-down time. Spend 15 minutes in somatic relaxation.",
        summary: "Your current journal records show resilient energy but highlight mild peer comparison triggers. (Mock simulated response)"
      });
    }

    const examContext = profile ? `Preparing for ${profile.examType} exam.` : "";
    const studentName = profile ? profile.name : "Student";

    const journalsSummary = entries.map((e: any, index: number) => {
      return `Entry #${index + 1} (${e.date}) - Mood: ${e.moodScore}/10. Content: ${e.text}`;
    }).join("\n\n");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are evaluating all recorded journals for student: ${studentName}. ${examContext}
Find hidden, recurring, or subconscious triggers, timing fatigue, or exam-specific anxieties across these entries.

Here are the entries:
${journalsSummary}`,
      config: {
        systemInstruction: "You are the head of student psychoanalysis for MindOS. Synthesize multiple journals to discover deep triggers or emotional patterns that might not be obvious in a single entry. Provide actionable, supportive evidence.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insightsOnTriggers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 deep observations (e.g., 'Anxiety peaks 40% when evening study is mentioned', 'Frustration matches days with low self-scores on tests'). Make them highly specific to the content."
            },
            rebuildingStrategy: {
              type: Type.STRING,
              description: "A customized psychological routine adjustments, boundaries, study micro-actions, or self-dialogue shift to handle these findings."
            },
            summary: {
              type: Type.STRING,
              description: "A summary of their current mental trajectory across the logged history."
            }
          },
          required: ["insightsOnTriggers", "rebuildingStrategy", "summary"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Pattern discovery error:", error);
    res.status(500).json({ error: "Failed to discover patterns: " + error.message });
  }
});

// API endpoint: 3. AI Wellness Coach Chat
app.post("/api/coach-chat", async (req, res) => {
  try {
    const { messages, profile, recentEntries } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages history required" });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      const lastMsg = messages[messages.length - 1];
      return res.json({
        text: `Hello ${profile?.name || "Student"}! I am your wellness coach. (Dev Preview Mode: Gemini is simulated). I hear your message: "${lastMsg.text}". Stay centered and practice box breathing!`
      });
    }

    const examContext = profile ? `Student: ${profile.name}, preparing for the ${profile.examType} exam.` : "";
    const historyPrompt = messages.map((m: any) => `${m.sender === 'user' ? 'Student' : 'Coach'}: ${m.text}`).join("\n");
    const lastEntryContext = (recentEntries && recentEntries.length > 0) 
      ? `Recent entries summary: avg mood ${ (recentEntries.reduce((a:any, b:any) => a + b.moodScore, 0)/recentEntries.length).toFixed(1) }` 
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `${examContext} ${lastEntryContext}
Conversation History:
${historyPrompt}

Generate the next Coach message of response. Keep it deeply empathetic, psychologically reassuring, focused, and under 5 sentences. Use bullet points or short prompts if suggesting tiny study relief exercises.`,
      config: {
        systemInstruction: "You are MindOS AI, a compassionate student wellness coach. You listen, encourage sound study habits, validate pressure feelings, and provide practical stress hacks (somatic, cognitive reframing, sleep rules). Never diagnose clinically; emphasize standard coping techniques."
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to chat: " + error.message });
  }
});

// API endpoint: 4. Generate Personalized Mindfulness Exercise
app.post("/api/generate-exercise", async (req, res) => {
  try {
    const { type, duration, profile, currentMood } = req.body;
    
    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        title: `Calming somatic reset for ${profile?.examType || "Exams"}`,
        type: type || "breathing",
        duration: duration || "5 mins",
        script: "Close your eyes. Inhale peace, exhale exam tension. (Simulated script output). Bring your focus to your feet planted on the ground.",
        steps: [
          "Plant feet firmly on the ground",
          "Inhale deeply for 4 seconds",
          "Slow release for 6 seconds",
          "Acknowledge the space around you"
        ],
        tips: [
          "Perfect right before opening mock exams",
          "Keep shoulders lowered and jaw loose"
        ]
      });
    }

    const examContext = profile ? `preparing for ${profile.examType}` : "student exam prep";
    const moodContext = currentMood ? `Current student mood score is ${currentMood}/10.` : "";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Create a custom, step-by-step mindfulness exercise.
- Practice Type requested: ${type || "breathing"} (breathing, somatic, visualization, or grounding)
- Target Duration: ${duration || "5 mins"}
- Student context: ${profile?.name || "Student"}, ${examContext}. ${moodContext}`,
      config: {
        systemInstruction: "You are a professional MBSR (Mindfulness-Based Stress Reduction) therapist certified for high-pressure academic prep. Author high-quality, soothing guides that help transition from cortisol survival mode to logical, relaxed performance.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Creative, calming title incorporating the type and academic pressure relief"
            },
            type: {
              type: Type.STRING
            },
            duration: {
              type: Type.STRING
            },
            script: {
              type: Type.STRING,
              description: "Fully authored guided meditation monologue (1-2 paragraphs) in standard soothing meditation format."
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List 3 to 6 tangible physical instructions or respiratory commands."
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List 2 crucial implementation tips (e.g., posture alignment, focal anchor tips)"
            }
          },
          required: ["title", "type", "duration", "script", "steps", "tips"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Exercise generation error:", error);
    res.status(500).json({ error: "Failed to generate exercise: " + error.message });
  }
});

// Configure Vite integration for develop and serve built files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Dev Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production files from dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MindOS] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
