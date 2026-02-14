
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CareerPath, ProfileInputs, GroundingSource } from "../types";

export const analyzeCareer = async (inputs: ProfileInputs): Promise<{ data: CareerPath; sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Convert resume to base64 if it's a file
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

  const prompt = `
    You are an elite Career Strategy Consultant and Technical Recruiter.
    Analyze the following professional profiles and create a comprehensive career roadmap for the user's dream career.

    DREAM CAREER GOAL: ${inputs.dreamCareer}
    LINKEDIN PROFILE: ${inputs.linkedinUrl || "Not provided"}
    GITHUB PROFILE: ${inputs.githubUrl || "Not provided"}
    
    RESUME DATA IS ATTACHED AS A DOCUMENT OR TEXT.

    Use Google Search to research the latest hiring trends, required certifications, and project benchmarks for a ${inputs.dreamCareer} in the current year.

    Return a strictly structured JSON response with the following schema:
    {
      "currentAssessment": "A paragraph summarizing their current professional standing relative to their dream career.",
      "marketOutlook": "Current market demand and salary expectations for this role.",
      "skillsGap": [
        {"skill": "Skill Name", "current": 1-10, "required": 1-10}
      ],
      "roadmap": [
        {"title": "Phase Name", "duration": "e.g. 3 months", "description": "Summary", "tasks": ["Task 1", "Task 2"]}
      ],
      "projects": [
        {"title": "Project Idea", "description": "Detailed explanation", "difficulty": "Beginner|Intermediate|Advanced", "techStack": ["React", "Rust", "etc"]}
      ],
      "learningResources": [
        {"title": "Course/Article Name", "platform": "Coursera|Udemy|Medium|GitHub", "type": "Course|Article|Open Source|Certification", "url": "URL if known or placeholder"}
      ],
      "profileOptimization": {
        "linkedinTips": ["Actionable tip 1", "Actionable tip 2"],
        "resumeTips": ["Actionable tip 1", "Actionable tip 2"],
        "keywords": ["Keyword 1", "Keyword 2"]
      },
      "vibeCheck30Day": {
        "title": "A catchy title for the 30-day reflection",
        "description": "A reassuring summary of how the user should be feeling/thinking after 30 days of this plan.",
        "milestones": ["Reflective milestone 1", "Reflective milestone 2"]
      },
      "suggestedNextPaths": ["Path 1 (e.g. Technical Architect)", "Path 2 (e.g. CTO)"]
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
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText) as CareerPath;

    // Extract grounding sources
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
