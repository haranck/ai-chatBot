import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "crypto";
import { authConfig } from "../config/auth";

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

export function signAccessToken(userId: string): string {
  return jwt.sign({}, authConfig.accessTokenSecret, {
    subject: userId,
    expiresIn: authConfig.accessTokenTtlSeconds,
    algorithm: "HS256",
  });
}

/** Returns the user id. Throws jsonwebtoken errors (e.g. TokenExpiredError). */
export function verifyAccessToken(token: string): string {
  const payload = jwt.verify(token, authConfig.accessTokenSecret, { algorithms: ["HS256"] });
  if (typeof payload === "string" || !payload.sub) {
    throw new jwt.JsonWebTokenError("Malformed access token");
  }
  return payload.sub;
}

export function signRefreshToken(userId: string, sessionId: string): string {
  return jwt.sign({ sid: sessionId }, authConfig.refreshTokenSecret, {
    subject: userId,
    jwtid: randomUUID(), // every rotated token is unique
    expiresIn: authConfig.refreshTokenTtlSeconds,
    algorithm: "HS256",
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, authConfig.refreshTokenSecret, { algorithms: ["HS256"] });
  if (typeof payload === "string" || !payload.sub || typeof payload.sid !== "string") {
    throw new jwt.JsonWebTokenError("Malformed refresh token");
  }
  return { userId: payload.sub, sessionId: payload.sid };
}

// Only hashes of refresh tokens are stored, so a leaked database can't be replayed
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
