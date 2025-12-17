export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isError?: boolean;
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
