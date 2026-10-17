import { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/tokens";
import { HttpError } from "../utils/httpError";

export interface AuthRequest extends Request {
  userId: string;
}

// Requires "Authorization: Bearer <access token>"
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return next(new HttpError(401, "Please sign in to continue.", "UNAUTHENTICATED"));
  }

  try {
    (req as AuthRequest).userId = verifyAccessToken(token);
    next();
  } catch (err) {
    // TOKEN_EXPIRED tells the client to refresh and retry
    next(
      err instanceof jwt.TokenExpiredError
        ? new HttpError(401, "Access token expired.", "TOKEN_EXPIRED")
        : new HttpError(401, "Invalid access token.", "INVALID_TOKEN"),
    );
  }
};
