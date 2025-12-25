
import { GoogleGenAI } from "@google/genai";
import { NOTION_AI_SYSTEM_INSTRUCTION } from "../constants";
import { Message, Attachment } from "../types";

let client: GoogleGenAI | null = null;
// Explicitly type history to maintain correct conversation context structure
let history: { role: 'user' | 'model'; parts: any[] }[] = [];

export const AVAILABLE_MODELS = [
  // Recommended models for text tasks as per latest SDK guidelines
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash', description: 'Fast, perfect for writing.' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', description: 'Advanced reasoning & coding.' },
];

const getClient = () => {
  if (!client) {
    // Always use process.env.API_KEY directly as specified
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("AUTH_ERROR: API_KEY environment variable is not set.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const clearHistory = () => {
  history = [];
};

export const sendMessage = async (
  message: string, 
  modelId: string = 'gemini-3-flash-preview',
  attachments: Attachment[] = []
): Promise<string> => {
  const ai = getClient();
  
  // Construct dynamic system instruction including real-time context
  const now = new Date();
  const timeContext = `\nThe current date and time is: ${now.toLocaleString()}\n`;
  const systemInstruction = NOTION_AI_SYSTEM_INSTRUCTION + timeContext;

  // Build the parts for the current message
  const parts: any[] = [];
  
  // 1. Process attachments to be appended as text (txt, docx)
  let textContext = "";
  attachments.filter(a => !a.isInline).forEach(a => {
    textContext += `\n\n--- FILE: ${a.name} ---\n${a.data}\n--- END OF FILE ---\n`;
  });
  
  // 2. Main text part including context from files
  parts.push({ text: (textContext + message).trim() });

  // 3. Process attachments to be sent as inline data (PDFs)
  attachments.filter(a => a.isInline).forEach(a => {
    parts.push({
      inlineData: {
        mimeType: a.mimeType,
        data: a.data
      }
    });
  });

  try {
    // Core content generation call using standard SDK parameters
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

    // Directly access the .text property from GenerateContentResponse
    const responseText = response.text;
    
    if (!responseText) {
      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error("SAFETY_ERROR: The response was blocked by safety filters.");
      }
      throw new Error("EMPTY_ERROR: The model returned an empty response.");
    }

    // Update conversation history
    history.push({ role: 'user', parts });
    history.push({ role: 'model', parts: [{ text: responseText }] });
    
    return responseText;
  } catch (error: any) {
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("Quota")) {
      throw new Error("QUOTA_ERROR: You've reached the API quota. Please wait a moment.");
    }
    if (errorMsg.includes("401") || errorMsg.includes("403")) {
      throw new Error("AUTH_ERROR: Invalid API key.");
    }
    throw error;
  }
};

export const summarizeConversation = async (messages: Message[]): Promise<string> => {
  const ai = getClient();
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
