/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { GemniResponseSchema } from "../types";

const createClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error(
      "VITE_GEMINI_API_KEY is missing from environment variables. Please add it to .env.local"
    );
    throw error;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSteps = async (
  prompt: string,
  context?: string
): Promise<GemniResponseSchema | null> => {
  try {
    const client = createClient();

    const fullPrompt = context 
      ? `The user wants to know how to "${context}". Specifically, expand on the step: "${prompt}". Provide 5 to 8 detailed sub-steps.`
      : `The user wants to know: "${prompt}". Provide a list of 5 to 10 distinct, actionable steps to achieve this.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: "You are a helpful, friendly, and concise SimCity-style advisor. Keep steps clear and readable. Use short sentences (max 3 sentences per step). Return JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "A short, punchy title for the step",
                  },
                  description: {
                    type: Type.STRING,
                    description: "A 1-3 sentence explanation",
                  },
                },
                required: ["title", "description"],
              },
            },
          },
          required: ["steps"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GemniResponseSchema;
    }
    return null;

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for specific error types
    if (errorMessage.includes("quota") || errorMessage.includes("429")) {
      throw new Error(
        "API quota exceeded: You've hit the Gemini API rate limit. Please wait and try again later."
      );
    } else if (
      errorMessage.includes("API_KEY") ||
      errorMessage.includes("VITE_GEMINI_API_KEY") ||
      errorMessage.includes("apiKey") ||
      errorMessage.includes("invalid API key")
    ) {
      throw new Error(
        "API key error: VITE_GEMINI_API_KEY is missing or invalid. Check your .env.local file."
      );
    } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      throw new Error(
        "Network error: Could not connect to the API. Check your internet connection."
      );
    } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
      throw new Error(
        "Authentication error: Your API key is invalid. Check your .env.local file."
      );
    } else if (errorMessage.includes("400")) {
      throw new Error(
        "Bad request: The API rejected the request. Please try with different input."
      );
    } else if (errorMessage.includes("500")) {
      throw new Error(
        "Server error: The API is currently experiencing issues. Please try again later."
      );
    }
    
    // Re-throw with original message if caught
    throw error;
  }
};
