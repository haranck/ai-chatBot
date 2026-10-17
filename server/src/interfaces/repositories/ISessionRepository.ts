import { SessionRecord } from "../../types/auth.types";

export interface NewSession {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
}

export interface ISessionRepository {
  create(session: NewSession): Promise<void>;
  findById(id: string): Promise<SessionRecord | null>;
  rotate(id: string, update: { tokenHash: string; prevTokenHash: string; expiresAt: Date }): Promise<void>;
  delete(id: string): Promise<void>;
}
