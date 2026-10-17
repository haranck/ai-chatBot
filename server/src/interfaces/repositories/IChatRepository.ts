import { ConversationDTO, MessageDTO, MessageRole } from "../../types/chat.types";

export interface IChatRepository {
  createConversation(userId: string, title: string): Promise<ConversationDTO>;
  findConversation(userId: string, conversationId: string): Promise<ConversationDTO | null>;
  listConversations(userId: string, limit: number): Promise<ConversationDTO[]>;
  deleteConversation(userId: string, conversationId: string): Promise<boolean>;
  addMessages(conversationId: string, messages: { role: MessageRole; content: string }[]): Promise<void>;
  getMessages(conversationId: string): Promise<MessageDTO[]>;
  getRecentMessages(conversationId: string, limit: number): Promise<MessageDTO[]>;
}
