import OpenAI from "openai";

export const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
    // Fail fast on rate limits so the next model answers right away.
    // (By default the SDK silently waits up to a minute and retries.)
    maxRetries: 0,
    timeout: 60 * 1000,
});

// gpt-oss-20b answers about twice as fast as gpt-oss-120b
export const AI_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

// Each Groq model has its own free-plan limits, so when one is used up
// the next one in this list answers instead
export const FALLBACK_MODELS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"].filter(
    (model) => model !== AI_MODEL,
);
