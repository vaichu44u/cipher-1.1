
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CareerPath, ProfileInputs, GroundingSource } from "../types";

export const analyzeCareer = async (inputs: ProfileInputs): Promise<{ data: CareerPath; sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let resumePart: any = { text: inputs.resumeText || "No resume text provided." };
  if (inputs.resumeFile) {
    const base64 = await fileToBase64(inputs.resumeFile);
    resumePart = {
      inlineData: {
        data: base64,
        mimeType: inputs.resumeFile.type,
      },
    };
  }

  const isAudit = !!inputs.roadmapState;
  const auditContext = isAudit 
    ? `SYNC PROTOCOL ACTIVE: Evaluating current progress milestones. 
       Current Synchronization: ${JSON.stringify(inputs.roadmapState)}.
       RECALIBRATE trajectory. If the user is crushing it, unlock 'Ascension' tier tasks. If momentum is low, inject remedial 'Core' modules.`
    : "INITIAL UPLINK: Architecting a new career ascension path.";

  const prompt = `
    You are the 'Pathfinder AI'—a high-energy, tactical career architect. 
    ${auditContext}

    TARGET SPECS:
    - CAREER GOAL: ${inputs.dreamCareer}
    - CURRENT TIER: ${inputs.experienceLevel}
    - TEMPORAL BUDGET: ${inputs.weeklyCommitment} hrs/week
    
    TACTICAL PLANNING RULES:
    1. Calibrate objectives to Tier: ${inputs.experienceLevel}.
    2. Pace modules based on ${inputs.weeklyCommitment} hrs/week.
    3. Be encouraging but direct. Use terms like 'Uplink', 'Synchronization', 'XP Gain', and 'Tactical Objective'.
    4. Search for 2024-2025 market trends using Google Search.
    5. CRITICAL: Response MUST be pure, valid JSON.

    Return a JSON response with this schema:
    {
      "currentAssessment": "High-energy tactical summary of their current status",
      "marketOutlook": "Latest intel on market shifts",
      "skillsGap": [{"skill": "Skill", "current": 0-10, "required": 0-10}],
      "roadmap": [{"title": "Module Title", "duration": "e.g. 4 Weeks", "description": "High-level goal", "tasks": ["Specific tactical task"]}],
      "projects": [{"title": "Project Codename", "description": "Mission brief", "difficulty": "Beginner|Intermediate|Advanced", "techStack": ["Stack"]}],
      "learningResources": [{"title": "Intel Source", "platform": "Platform", "type": "Type", "url": "URL"}],
      "profileOptimization": {"linkedinTips": ["Actionable tip"], "resumeTips": ["Actionable tip"], "keywords": ["Keyword"]},
      "vibeCheck30Day": {"title": "Neural Rewire Goal", "description": "Mindset shift", "milestones": ["Day 7 milestone", "Day 15 milestone", "Day 30 milestone"]},
      "suggestedNextPaths": ["Path"],
      "agentReasoning": ["Pathfinder internal log 1", "Pathfinder internal log 2"]
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [
          resumePart,
          { text: prompt }
        ] 
      },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const resultText = response.text?.trim() || "{}";
    const cleanedJson = resultText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const data = JSON.parse(cleanedJson) as CareerPath;

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Search Result",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { data, sources };
  } catch (error: any) {
    console.error("Pathfinder Error:", error);
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_RESET");
    }
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
