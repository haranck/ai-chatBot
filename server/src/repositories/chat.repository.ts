import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import { IChatRepository } from "../interfaces/repositories/IChatRepository";
import { ConversationDTO, MessageDTO, MessageRole } from "../types/chat.types";
import { isObjectId } from "../utils/objectId";

const toConversation = (doc: {
  _id: unknown;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}): ConversationDTO => ({
  id: String(doc._id),
  title: doc.title,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const toMessage = (doc: { _id: unknown; role: string; content: string; createdAt: Date }): MessageDTO => ({
  id: String(doc._id),
  role: doc.role as MessageRole,
  content: doc.content,
  createdAt: doc.createdAt,
});

export class ChatRepository implements IChatRepository {
  async createConversation(userId: string, title: string): Promise<ConversationDTO> {
    const doc = await Conversation.create({ userId, title });
    return toConversation(doc);
  }

  async findConversation(userId: string, conversationId: string): Promise<ConversationDTO | null> {
    if (!isObjectId(conversationId)) return null;
    const doc = await Conversation.findOne({ _id: conversationId, userId }).lean();
    return doc ? toConversation(doc) : null;
  }

  async listConversations(userId: string, limit: number): Promise<ConversationDTO[]> {
    const docs = await Conversation.find({ userId }).sort({ updatedAt: -1 }).limit(limit).lean();
    return docs.map(toConversation);
  }

  async deleteConversation(userId: string, conversationId: string): Promise<boolean> {
    if (!isObjectId(conversationId)) return false;
    const { deletedCount } = await Conversation.deleteOne({ _id: conversationId, userId });
    if (deletedCount === 0) return false;

    await Message.deleteMany({ conversationId });
    return true;
  }

  async addMessages(
    conversationId: string,
    messages: { role: MessageRole; content: string }[],
  ): Promise<void> {
    await Promise.all([
      Message.insertMany(messages.map((m) => ({ ...m, conversationId }))),
      // bump the chat to the top of the sidebar
      Conversation.updateOne(
        { _id: conversationId },
        { $set: { updatedAt: new Date() } },
        { timestamps: false },
      ),
    ]);
  }

  async getMessages(conversationId: string): Promise<MessageDTO[]> {
    const docs = await Message.find({ conversationId }).sort({ createdAt: 1, _id: 1 }).lean();
    return docs.map(toMessage);
  }

  async getRecentMessages(conversationId: string, limit: number): Promise<MessageDTO[]> {
    if (!isObjectId(conversationId)) return [];
    const docs = await Message.find({ conversationId })
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .lean();
    return docs.reverse().map(toMessage);
  }
}
