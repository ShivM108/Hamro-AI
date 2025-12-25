export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // base64 for PDF/Images, or string for Text
  isInline: boolean; // true if it should be sent as inlineData (PDF), false if appended to prompt (TXT)
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isError?: boolean;
  attachments?: Attachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  THINKING = 'THINKING'
}