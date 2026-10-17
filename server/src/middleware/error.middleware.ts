import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { OpenAI } from "openai";
import { HttpError } from "../utils/httpError";

// Groq says e.g. "Please try again in 2m10.032s"
function retryAfterSeconds(message: string): number | null {
  const m = /try again in (?:(\d+)h)?(?:(\d+)m)?(?:([\d.]+)s)?/.exec(message);
  if (!m || !(m[1] || m[2] || m[3])) return null;
  return Math.ceil(Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0));
}

function rateLimitMessage(groqMessage: string): string {
  const wait = retryAfterSeconds(groqMessage);
  const when = !wait
    ? "in a minute"
    : wait < 60
      ? `in ${wait} seconds`
      : `in about ${Math.ceil(wait / 60)} minutes`;
  const scope = groqMessage.includes("per day") ? "daily" : "per-minute";
  return `The free AI plan's ${scope} limit is used up on all models right now. Please try again ${when}.`;
}

// Express 5 forwards errors thrown in async handlers here
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ success: false, error: err.message, code: err.code });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ success: false, error: err.issues[0]?.message ?? "Invalid request" });
    return;
  }

  if (err instanceof OpenAI.APIError) {
    console.error("AI provider error:", err.status, err.message);
    const busy = err.status === 429;
    res.status(busy ? 429 : 502).json({
      success: false,
      error: busy
        ? rateLimitMessage(err.message)
        : "The AI service is having trouble right now. Please try again.",
    });
    return;
  }

  if (err?.message === "Not allowed by CORS") {
    res.status(403).json({ success: false, error: "Origin not allowed" });
    return;
  }

  // e.g. malformed JSON body from express.json()
  if (typeof err?.status === "number" && err.status < 500) {
    res.status(err.status).json({ success: false, error: "Bad request" });
    return;
  }

  console.error(err);
  res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
};
