
import { GoogleGenAI, Type } from "@google/genai";
import { Service } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Gemini 2.5 Flash for speed
const MODEL_NAME = 'gemini-2.5-flash';

export interface SmartSearchResponse {
  category?: string;
  location?: string;
  intent: 'search' | 'recommendation' | 'general';
}

/**
 * Analyzes a natural language query to extract category and location context for Libreville.
 */
export const analyzeSearchQuery = async (query: string): Promise<SmartSearchResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `User query: "${query}".
      Context: This is for a local service marketplace "Allowork" in Libreville, Gabon.
      Task: Extract the service category (if any) and the location/neighborhood (if any).
      Neighborhoods are like: Louis, Charbonnages, Nzeng-Ayong, Akanda, Owendo, Centre Ville, etc.
      
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "The likely service category, e.g., Plomberie, Ménage" },
            location: { type: Type.STRING, description: "The recognized Libreville neighborhood" },
            intent: { type: Type.STRING, enum: ['search', 'recommendation', 'general'] }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as SmartSearchResponse;
    }
    return { intent: 'general' };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return { intent: 'general' };
  }
};

/**
 * Generates a helpful description for a user's service request based on a title/brief.
 */
export const generateRequestDescription = async (title: string, category: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `The user wants to post a service request on Allowork (Libreville) with title "${title}" in category "${category}".
            Write a clear, polite, and detailed description (in French) that they can use. Keep it under 50 words.`
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
};

/**
 * Generates a recommendation message based on a service.
 */
export const generateServiceRecommendation = async (service: Service): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Write a very short, catchy 1-sentence promotion in French for this service in Libreville:
      Service: ${service.title} by ${service.providerName} located in ${service.location}.`,
    });
    return response.text || "Découvrez ce service exceptionnel !";
  } catch (e) {
    return "Service recommandé pour vous.";
  }
};

/**
 * Acts as a chat assistant for the platform
 */
export const getChatAssistantResponse = async (userMessage: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `You are the AI assistant for Allowork, a service marketplace in Libreville (Gabon). 
            Answer the user's question helpfully in French. Keep it brief.
            User: ${userMessage}`,
        });
        return response.text || "Je ne suis pas sûr de comprendre, pouvez-vous reformuler ?";
    } catch (e) {
        return "Désolé, je rencontre des problèmes techniques pour le moment.";
    }
}
