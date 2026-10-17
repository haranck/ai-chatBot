import { IConversationService } from "../interfaces/services/IConversationService";
import { IChatRepository } from "../interfaces/repositories/IChatRepository";
import { ConversationDTO, MessageDTO } from "../types/chat.types";
import { HttpError } from "../utils/httpError";

const SIDEBAR_LIMIT = 100;

export class ConversationService implements IConversationService {
  constructor(private readonly chatRepo: IChatRepository) {}

  list(userId: string): Promise<ConversationDTO[]> {
    return this.chatRepo.listConversations(userId, SIDEBAR_LIMIT);
  }

  async getMessages(
    userId: string,
    conversationId: string,
  ): Promise<{ conversation: ConversationDTO; messages: MessageDTO[] }> {
    const conversation = await this.chatRepo.findConversation(userId, conversationId);
    if (!conversation) throw new HttpError(404, "Conversation not found");

    const messages = await this.chatRepo.getMessages(conversation.id);
    return { conversation, messages };
  }

  async remove(userId: string, conversationId: string): Promise<void> {
    const deleted = await this.chatRepo.deleteConversation(userId, conversationId);
    if (!deleted) throw new HttpError(404, "Conversation not found");
  }
}
