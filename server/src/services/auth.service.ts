import { randomUUID } from "crypto";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { IAuthService } from "../interfaces/services/IAuthService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { ISessionRepository } from "../interfaces/repositories/ISessionRepository";
import { AuthResult, UserDTO } from "../types/auth.types";
import { authConfig } from "../config/auth";
import { HttpError } from "../utils/httpError";
import {
  hashToken,
  RefreshTokenPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens";

const sessionExpired = () =>
  new HttpError(401, "Your session has expired. Please sign in again.", "SESSION_EXPIRED");

const refreshExpiry = () => new Date(Date.now() + authConfig.refreshTokenTtlSeconds * 1000);

export class AuthService implements IAuthService {
  constructor(
    private readonly google: OAuth2Client,
    private readonly users: IUserRepository,
    private readonly sessions: ISessionRepository,
  ) {}

  async loginWithGoogle(credential: string, userAgent?: string): Promise<AuthResult> {
    let payload: TokenPayload | undefined;
    try {
      // Checks Google's signature, expiry, issuer and that the token is for our client id
      const ticket = await this.google.verifyIdToken({
        idToken: credential,
        audience: authConfig.googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new HttpError(401, "Google sign-in failed. Please try again.", "INVALID_GOOGLE_TOKEN");
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new HttpError(401, "Your Google account email is not verified.", "EMAIL_NOT_VERIFIED");
    }

    const user = await this.users.upsertFromGoogle({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
      avatar: payload.picture ?? null,
    });

    const sessionId = randomUUID();
    const refreshToken = signRefreshToken(user.id, sessionId);
    await this.sessions.create({
      id: sessionId,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiry(),
      userAgent,
    });

    return { user, accessToken: signAccessToken(user.id), refreshToken };
  }

  // Rotation: every refresh swaps the refresh token for a new one
  async refresh(refreshToken: string): Promise<AuthResult> {
    let payload: RefreshTokenPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw sessionExpired();
    }

    const session = await this.sessions.findById(payload.sessionId);
    if (!session || session.userId !== payload.userId) throw sessionExpired();

    const presented = hashToken(refreshToken);
    const isCurrent = presented === session.tokenHash;
    const isJustReplaced =
      presented === session.prevTokenHash &&
      session.rotatedAt !== null &&
      Date.now() - session.rotatedAt.getTime() < authConfig.refreshReuseGraceMs;

    if (!isCurrent && !isJustReplaced) {
      // An old token was replayed, so it may have leaked: end the session
      await this.sessions.delete(session.id);
      throw sessionExpired();
    }

    const user = await this.users.findById(session.userId);
    if (!user) {
      await this.sessions.delete(session.id);
      throw sessionExpired();
    }

    const nextRefreshToken = signRefreshToken(user.id, session.id);
    await this.sessions.rotate(session.id, {
      tokenHash: hashToken(nextRefreshToken),
      prevTokenHash: session.tokenHash,
      expiresAt: refreshExpiry(),
    });

    return { user, accessToken: signAccessToken(user.id), refreshToken: nextRefreshToken };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    try {
      const { sessionId } = verifyRefreshToken(refreshToken);
      await this.sessions.delete(sessionId);
    } catch {
      // token already invalid or expired: nothing to revoke
    }
  }

  async getUser(userId: string): Promise<UserDTO> {
    const user = await this.users.findById(userId);
    if (!user) throw sessionExpired();
    return user;
  }
}
