import { ConversationDTO, MessageDTO } from "../../types/chat.types";

export interface IConversationService {
  list(userId: string): Promise<ConversationDTO[]>;
  getMessages(
    userId: string,
    conversationId: string,
  ): Promise<{ conversation: ConversationDTO; messages: MessageDTO[] }>;
  remove(userId: string, conversationId: string): Promise<void>;
}
