
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Product } from "../types";

// Safe access to process.env.API_KEY to ensure standard ESM browser compatibility
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

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

export const aiChat = async (history: ChatMessage[], availableProducts: Product[]) => {
  try {
    const productContext = availableProducts.map(p => `${p.name} (₹${p.price})`).join(', ');
    const systemInstruction = `You are "Vintage Assistant", an AI concierge for FM Vintage, a premium marketplace for vintage artifacts. 
    Your tone is sophisticated, professional, and helpful. 
    Current Inventory: ${productContext}.
    Help users find artifacts, explain features, and represent the brand. Keep responses concise and focused on the vintage collection.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history.map(m => ({ parts: [{ text: m.text }], role: m.role })),
      config: {
        systemInstruction
      }
    });

    return response.text || "I'm sorry, I couldn't process that. How can I assist you with our collection?";
  } catch (error) {
    console.error("Chat Error:", error);
    return "The archive connection is unstable. Please try again in a moment.";
  }
};
