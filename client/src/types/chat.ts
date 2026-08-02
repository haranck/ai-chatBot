export type MessageSender = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatApiRequest {
  prompt: string;
  message?: string;
}

export interface ChatApiResponse {
  success?: boolean;
  reply?: string;
  response?: string;
  error?: string;
}
