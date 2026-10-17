import { ChatResult } from "../../types/chat.types";

export interface IAIService {
  askAI(userId: string, message: string, conversationId?: string): Promise<ChatResult>;
}
