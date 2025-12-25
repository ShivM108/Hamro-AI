import { GoogleGenAI } from "@google/genai";
import { NOTION_AI_SYSTEM_INSTRUCTION } from "../constants";
import { Message, Attachment } from "../types";

// Explicitly type history to maintain correct conversation context structure
let history: { role: 'user' | 'model'; parts: any[] }[] = [];

export const AVAILABLE_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash', description: 'Fast, perfect for writing.' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', description: 'Advanced reasoning & coding.' },
];

export const clearHistory = () => {
  history = [];
};

export const sendMessage = async (
  message: string, 
  modelId: string = 'gemini-3-flash-preview',
  attachments: Attachment[] = []
): Promise<string> => {
  // Create a new instance right before the call to ensure fresh API key usage
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const now = new Date();
  const timeContext = `\nThe current date and time is: ${now.toLocaleString()}\n`;
  const systemInstruction = NOTION_AI_SYSTEM_INSTRUCTION + timeContext;

  const parts: any[] = [];
  
  let textContext = "";
  attachments.filter(a => !a.isInline).forEach(a => {
    textContext += `\n\n--- FILE: ${a.name} ---\n${a.data}\n--- END OF FILE ---\n`;
  });
  
  parts.push({ text: (textContext + message).trim() });

  attachments.filter(a => a.isInline).forEach(a => {
    parts.push({
      inlineData: {
        mimeType: a.mimeType,
        data: a.data
      }
    });
  });

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...history,
        { role: 'user', parts }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const responseText = response.text;
    
    if (!responseText) {
      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error("SAFETY_ERROR: The response was blocked by safety filters.");
      }
      throw new Error("EMPTY_ERROR: The model returned an empty response.");
    }

    history.push({ role: 'user', parts });
    history.push({ role: 'model', parts: [{ text: responseText }] });
    
    return responseText;
  } catch (error: any) {
    const errorMsg = error.message || "";
    if (errorMsg.includes("Requested entity was not found")) {
      throw new Error("KEY_CONFIG_ERROR: The selected API key project was not found or billing is not enabled.");
    }
    if (errorMsg.includes("429") || errorMsg.includes("Quota")) {
      throw new Error("QUOTA_ERROR: You've reached the API quota. Please wait a moment.");
    }
    if (errorMsg.includes("401") || errorMsg.includes("403") || errorMsg.includes("API_KEY_INVALID")) {
      throw new Error("AUTH_ERROR: Invalid or missing API key.");
    }
    throw error;
  }
};

export const summarizeConversation = async (messages: Message[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chatHistory = messages
    .filter(m => m.id !== 'intro')
    .map(m => `${m.role === 'user' ? 'User' : 'Hamro AI'}: ${m.content}`)
    .join('\n\n');

  if (!chatHistory.trim()) {
    throw new Error("No conversation history to summarize.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this conversation in bullet points:\n\n${chatHistory}`,
      config: {
        systemInstruction: "You are an executive assistant. Be concise.",
        temperature: 0.2,
      },
    });

    return response.text || "Failed to generate summary.";
  } catch (error: any) {
    throw new Error("Failed to summarize: " + error.message);
  }
};