import { GoogleGenAI, Type } from "@google/genai";
import { Job, UserProfile, AiRecommendationResponse, ResumeAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getJobRecommendations = async (
  profile: UserProfile,
  jobs: Job[]
): Promise<AiRecommendationResponse | null> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Act as an expert career advisor AI.
        
        User Profile:
        Name: ${profile.name}
        Skills: ${profile.skills.join(', ')}
        Experience: ${profile.experience}
        Bio: ${profile.bio}

        Available Jobs:
        ${JSON.stringify(jobs.map(j => ({ id: j.id, title: j.title, company: j.company, requirements: j.requirements, description: j.description })))}

        Task:
        Analyze the user's profile against the available jobs. 
        Select the top 3 matches. 
        Provide a match score (0-100) and a concise reason why it's a good match.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  jobId: { type: Type.STRING },
                  matchScore: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ['jobId', 'matchScore', 'reason']
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AiRecommendationResponse;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return null;
  }
};

export const generateJobDescription = async (title: string, company: string, keywords: string): Promise<string> => {
    if (!apiKey) return "API Key missing. Please configure your environment.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a professional, engaging, and concise job description (approx 80-100 words) for a "${title}" position at "${company}". Incorporate these keywords/skills: ${keywords}. Format as plain text.`,
        });
        return response.text || "Failed to generate description.";
    } catch (e) {
        console.error("Error generating description", e);
        return "Error generating description. Please try again.";
    }
}

export const generateJobCoverImage = async (title: string, company: string): Promise<string | null> => {
  // Construct a role-aware prompt
  const t = title.toLowerCase();
  let scene = "modern minimalist office desk with a laptop and coffee, soft natural lighting, shallow depth of field";
  
  if (t.includes('frontend') || t.includes('backend') || t.includes('developer') || t.includes('engineer') || t.includes('full') || t.includes('software')) {
    scene = "professional software developer workspace, close up of code on a modern monitor, mechanical keyboard, blurred open-plan office background, neutral tones, high tech, abstract tech patterns on screen, shallow depth of field";
  } else if (t.includes('design') || t.includes('ui') || t.includes('ux') || t.includes('creative') || t.includes('art')) {
    scene = "clean creative workspace, designer desk with sketches and color palettes, digital tablet, wireframes on screen, aesthetic, minimalist, natural lighting, shallow depth of field";
  } else if (t.includes('marketing') || t.includes('growth') || t.includes('sales') || t.includes('content') || t.includes('manager')) {
    scene = "modern collaboration space, strategy whiteboard with sticky notes, laptop with analytics dashboard (blurred), professional team atmosphere, soft corporate lighting, shallow depth of field";
  } else if (t.includes('data') || t.includes('ai') || t.includes('analyst') || t.includes('learning') || t.includes('scientist')) {
     scene = "abstract data visualization on a glass screen, modern data science environment, deep blue and cyan lighting, futuristic but realistic, technology focused, shallow depth of field, bokeh effect";
  } else if (t.includes('remote') || t.includes('home')) {
     scene = "cozy home office setup with plants, macbook, coffee cup, window with daylight, peaceful productive atmosphere, shallow depth of field, unobtrusive background";
  }

  const prompt = `Professional photography of ${scene}. Style: Realistic startup/corporate photography, muted tones, low visual noise, 4k resolution, cinematic lighting, shallow depth of field. Constraints: NO people faces in focus, NO text overlay, NO cartoon style, NO exaggerated AI art style. The image should serve as a subtle, high-quality background header for a job listing.`;

  return generateImage(prompt);
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  if (!apiKey) return null;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });
    
    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (e) {
    console.error("Error generating image", e);
    return null;
  }
}

export const chatWithAi = async (message: string): Promise<string> => {
  if (!apiKey) return "I can't access the AI service right now. Please check your API key.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: "You are a friendly and helpful AI career assistant for 'HireEm', a modern job portal. Assist users with job searching, resume tips, interview preparation, and general career advice. Keep your responses concise, encouraging, and professional.",
      }
    });
    return response.text || "I didn't have a response to that.";
  } catch (e) {
    console.error("AI Chat Error:", e);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}

export const analyzeResumeMatch = async (profile: UserProfile, job: Job): Promise<ResumeAnalysisResult | null> => {
  if (!apiKey) {
     console.error("API Key missing");
     return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Act as an expert ATS (Applicant Tracking System) and Career Coach.
        
        Job Details:
        Title: ${job.title}
        Company: ${job.company}
        Description: ${job.description}
        Requirements: ${job.requirements.join(', ')}

        Candidate Profile (Resume Data):
        Skills: ${profile.skills.join(', ')}
        Experience: ${profile.experience}
        Bio: ${profile.bio}

        Task:
        Analyze how well the candidate's profile matches the job description.
        Provide a match score (0-100), match level (High, Medium, Low).
        List key strengths (why they fit).
        List missing skills or gaps (keywords found in job but not in profile).
        Provide actionable tips to improve the resume for this specific job.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             matchScore: { type: Type.NUMBER },
             matchLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
             strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
             missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
             improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["matchScore", "matchLevel", "strengths", "missingSkills", "improvementTips"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ResumeAnalysisResult;

  } catch (e) {
    console.error("Error analyzing resume:", e);
    return null;
  }
};