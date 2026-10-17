import rateLimit from "express-rate-limit";
import { AuthRequest } from "./auth.middleware";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: "Too many sign-in attempts. Please try again later." },
});

// Per user, to protect the free AI quota (runs after requireAuth)
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => (req as AuthRequest).userId,
  message: { success: false, error: "You're sending messages too fast. Please wait a minute." },
});
