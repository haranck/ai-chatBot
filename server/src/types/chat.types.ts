export type MessageRole = "user" | "assistant";

export interface ConversationDTO {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageDTO {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface ChatResult {
  conversationId: string;
  title: string;
  reply: string;
}
