import { GoogleGenAI, Chat } from "@google/genai";
import { NOTION_AI_SYSTEM_INSTRUCTION } from "../constants";

let client: GoogleGenAI | null = null;
let chatSession: Chat | null = null;
let currentModelId: string = 'gemini-2.5-flash';

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro' },
];

const getClient = () => {
  if (!client) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const initializeChat = async (modelId: string = 'gemini-2.5-flash') => {
  const ai = getClient();
  
  // Add dynamic time to context
  const now = new Date();
  const timeContext = `\nThe current date and time is: ${now.toLocaleString()}\n`;
  const fullSystemInstruction = NOTION_AI_SYSTEM_INSTRUCTION + timeContext;

  chatSession = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: fullSystemInstruction,
      temperature: 0.7,
    },
  });
  
  currentModelId = modelId;
  return chatSession;
};

export const sendMessage = async (message: string, modelId?: string): Promise<string> => {
  // If modelId is provided and different from current, re-initialize
  // Or if no session exists
  if (!chatSession || (modelId && modelId !== currentModelId)) {
    await initializeChat(modelId || currentModelId);
  }
  
  if (!chatSession) {
    throw new Error("Failed to initialize chat session");
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};