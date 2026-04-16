import Chat from "../models/chat.model";
import { IChatRepository } from "../interfaces/repositories/IChatRepository";

export class ChatRepository implements IChatRepository {
  async saveChat(
    userId: string,
    question: string,
    answer: string,
  ): Promise<void> {
    await Chat.create({ userId, question, answer });
  }
}
//d