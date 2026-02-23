/// <reference types="vite/client" />
import { GemniResponseSchema } from "../types";

const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3001";
};

export const generateSteps = async (
  prompt: string,
  context?: string
): Promise<GemniResponseSchema | null> => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/generate-steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error ?? response.statusText ?? "Request failed";
      if (response.status === 429) {
        throw new Error(
          "API quota exceeded: You've hit the Gemini API rate limit. Please wait and try again later."
        );
      }
      if (response.status === 401 || message.includes("API key") || message.includes("GEMINI_API_KEY")) {
        throw new Error(
          "API key error: Backend GEMINI_API_KEY is missing or invalid. Check the backend .env file."
        );
      }
      if (response.status === 400) {
        throw new Error(
          "Bad request: The API rejected the request. Please try with different input."
        );
      }
      if (response.status >= 500) {
        throw new Error(
          "Server error: The API or backend is experiencing issues. Please try again later."
        );
      }
      if (message.includes("network") || message.includes("fetch") || response.status === 0) {
        throw new Error(
          "Network error: Could not reach the backend. Ensure the backend is running and VITE_API_URL is correct."
        );
      }
      throw new Error(message);
    }

    if (data?.steps && Array.isArray(data.steps)) {
      return data as GemniResponseSchema;
    }
    return null;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes("quota") ||
      errorMessage.includes("429") ||
      errorMessage.includes("API key") ||
      errorMessage.includes("GEMINI_API_KEY") ||
      errorMessage.includes("network") ||
      errorMessage.includes("fetch") ||
      errorMessage.includes("Bad request") ||
      errorMessage.includes("Server error")
    ) {
      throw error;
    }

    throw error;
  }
};
