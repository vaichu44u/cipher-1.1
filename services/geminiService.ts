
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
    ? `PROGRESS AUDIT MODE: The user has already started a roadmap. 
       Current Task Completion State: ${JSON.stringify(inputs.roadmapState)}.
       EVALUATE their progress and ADAPT the remaining roadmap. If they are excelling, suggest more advanced tasks. If they are stuck, suggest remedial resources.`
    : "INITIAL PLANNING MODE: Architect a brand new path.";

  const prompt = `
    You are an Autonomous Career Strategy Agent. 
    ${auditContext}

    CONSTRAINTS & CONTEXT:
    - TARGET GOAL: ${inputs.dreamCareer}
    - CURRENT LEVEL: ${inputs.experienceLevel}
    - TIME COMMITMENT: ${inputs.weeklyCommitment} hours per week
    - LINKEDIN: ${inputs.linkedinUrl || "Not provided"}
    - GITHUB: ${inputs.githubUrl || "Not provided"}
    
    AGENTIC PLANNING RULES:
    1. Plan tasks that are strictly calibrated to the ${inputs.experienceLevel} level.
    2. Adjust durations in the "roadmap" to reflect a ${inputs.weeklyCommitment} hour/week pace.
    3. Evaluate their current skills vs the goal and explain your reasoning in agentReasoning.
    4. Search for the latest market shifts (2024-2025) using Google Search.
    5. CRITICAL: Your output MUST be strictly valid JSON. 
       - DO NOT include markdown formatting or backticks.
       - DO NOT include trailing commas.
       - Escape all double quotes within string values.
       - Ensure every property name is quoted.

    Return a JSON response with this schema:
    {
      "currentAssessment": "string",
      "marketOutlook": "string",
      "skillsGap": [{"skill": "string", "current": 0-10, "required": 0-10}],
      "roadmap": [{"title": "string", "duration": "string", "description": "string", "tasks": ["string"]}],
      "projects": [{"title": "string", "description": "string", "difficulty": "Beginner|Intermediate|Advanced", "techStack": ["string"]}],
      "learningResources": [{"title": "string", "platform": "string", "type": "Course|Article|Open Source|Certification", "url": "string"}],
      "profileOptimization": {"linkedinTips": ["string"], "resumeTips": ["string"], "keywords": ["string"]},
      "vibeCheck30Day": {"title": "string", "description": "string", "milestones": ["string"]},
      "suggestedNextPaths": ["string"],
      "agentReasoning": ["string explaining specific strategy choices and audit results if applicable"]
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
    
    // Attempt to clean the string if the model accidentally included markdown
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
    console.error("Gemini Analysis Error:", error);
    if (error instanceof SyntaxError) {
      throw new Error(`The AI produced a malformed response. This happens occasionally during deep reasoning. Please try clicking "Audit Progress" or "Assemble Roadmap" again. Error: ${error.message}`);
    }
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
