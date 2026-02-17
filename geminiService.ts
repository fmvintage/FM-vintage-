
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (productName: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a compelling and detailed e-commerce product description for a product named "${productName}" in the "${category}" category. Keep it under 100 words and highlight features and benefits.`,
    });
    return response.text || "Description generation failed.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error generating AI description.";
  }
};

export const smartSearch = async (query: string, availableProducts: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user is searching for: "${query}". Based on this list of products: [${availableProducts.join(', ')}], return the top 3 most relevant product names as a comma-separated list. If none are relevant, return "none".`,
    });
    return response.text?.split(',').map(s => s.trim()) || [];
  } catch (error) {
    console.error("AI Search Error:", error);
    return [];
  }
};
