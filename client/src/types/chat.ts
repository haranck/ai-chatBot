export type MessageSender = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  retryPrompt?: string; // failed replies: the question to send again
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
}

export interface ChatApiResponse {
  success: boolean;
  reply: string;
  conversationId: string;
  title: string;
}
