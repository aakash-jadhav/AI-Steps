import { GoogleGenAI, Type } from "@google/genai";
import { GemniResponseSchema } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSteps = async (
  prompt: string,
  context?: string
): Promise<GemniResponseSchema | null> => {
  const client = createClient();
  if (!client) return null;

  const fullPrompt = context 
    ? `The user wants to know how to "${context}". Specifically, expand on the step: "${prompt}". Provide 5 to 8 detailed sub-steps.`
    : `The user wants to know: "${prompt}". Provide a list of 5 to 10 distinct, actionable steps to achieve this.`;

  try {
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

  } catch (error) {
    console.error("Error generating steps:", error);
    return null;
  }
};