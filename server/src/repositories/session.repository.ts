import Session from "../models/session.model";
import { ISessionRepository, NewSession } from "../interfaces/repositories/ISessionRepository";
import { SessionRecord } from "../types/auth.types";

export class SessionRepository implements ISessionRepository {
  async create({ id, userId, tokenHash, expiresAt, userAgent }: NewSession): Promise<void> {
    await Session.create({ _id: id, userId, tokenHash, expiresAt, userAgent: userAgent ?? null });
  }

  async findById(id: string): Promise<SessionRecord | null> {
    // TTL cleanup runs about once a minute, so also check expiry here
    const doc = await Session.findOne({ _id: id, expiresAt: { $gt: new Date() } }).lean();
    if (!doc) return null;

    return {
      id: doc._id,
      userId: String(doc.userId),
      tokenHash: doc.tokenHash,
      prevTokenHash: doc.prevTokenHash ?? null,
      rotatedAt: doc.rotatedAt ?? null,
    };
  }

  async rotate(
    id: string,
    update: { tokenHash: string; prevTokenHash: string; expiresAt: Date },
  ): Promise<void> {
    await Session.updateOne({ _id: id }, { $set: { ...update, rotatedAt: new Date() } });
  }

  async delete(id: string): Promise<void> {
    await Session.deleteOne({ _id: id });
  }
}
