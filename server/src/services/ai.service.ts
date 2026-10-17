import { OpenAI } from "openai";
import { IAIService } from "../interfaces/services/IAiService";
import { IChatRepository } from "../interfaces/repositories/IChatRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { SYSTEM_PROMPT, userContext } from "../utils/prompt";
import { AI_MODEL, FALLBACK_MODELS } from "../config/ai";
import { ChatResult, MessageDTO } from "../types/chat.types";
import { HttpError } from "../utils/httpError";

// Earlier messages sent back to the model so it remembers the conversation.
// Kept small to stay inside the Groq free-tier token limits.
const HISTORY_MESSAGES = 12;
const HISTORY_MAX_CHARS = 12_000;

const MODELS = [AI_MODEL, ...FALLBACK_MODELS];

function makeTitle(message: string): string {
  const firstLine = message.split("\n").find((line) => line.trim()) ?? message;
  const clean = firstLine.replace(/\s+/g, " ").trim();
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
}

// Newest messages that fit in the character budget
function fitHistory(messages: MessageDTO[]): MessageDTO[] {
  const kept: MessageDTO[] = [];
  let total = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    total += messages[i].content.length;
    if (total > HISTORY_MAX_CHARS) break;
    kept.unshift(messages[i]);
  }
  return kept;
}

export class AIService implements IAIService {
  constructor(
    private readonly ai: OpenAI,
    private readonly chatRepo: IChatRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async askAI(userId: string, message: string, conversationId?: string): Promise<ChatResult> {
    // Independent lookups run in parallel (each MongoDB round trip takes ~100+ ms)
    const [found, recent, user] = await Promise.all([
      conversationId ? this.chatRepo.findConversation(userId, conversationId) : null,
      conversationId ? this.chatRepo.getRecentMessages(conversationId, HISTORY_MESSAGES) : [],
      this.userRepo.findById(userId),
    ]);
    if (conversationId && !found) {
      throw new HttpError(404, "Conversation not found");
    }
    let conversation = found;

    // only used once the chat is confirmed to belong to this user
    const history = conversation ? fitHistory(recent) : [];

    const systemPrompt = user
      ? `${SYSTEM_PROMPT}\n\n${userContext(user.name, !conversation)}`
      : SYSTEM_PROMPT;

    const response = await this.complete([
      { role: "system", content: systemPrompt },
      ...history.map(({ role, content }) => ({ role, content })),
      { role: "user", content: message },
    ]);

    const reply =
      response.choices[0]?.message?.content?.trim() ||
      "I'm sorry, I could not generate a response.";

    // Create the chat only after the AI answered, so failed requests don't leave empty chats
    conversation ??= await this.chatRepo.createConversation(userId, makeTitle(message));
    await this.chatRepo.addMessages(conversation.id, [
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ]);

    return { conversationId: conversation.id, title: conversation.title, reply };
  }

  // Tries each model in turn when one hits its free-plan limit (HTTP 429)
  private async complete(messages: OpenAI.ChatCompletionMessageParam[]) {
    for (const [i, model] of MODELS.entries()) {
      try {
        return await this.ai.chat.completions.create({
          model,
          messages,
          // less hidden "thinking" = faster answers and fewer tokens used
          ...(model.startsWith("openai/gpt-oss") && { reasoning_effort: "low" as const }),
        });
      } catch (err) {
        const isLast = i === MODELS.length - 1;
        if (err instanceof OpenAI.APIError && err.status === 429 && !isLast) {
          console.warn(`${model} is at its rate limit, trying ${MODELS[i + 1]}`);
          continue;
        }
        throw err;
      }
    }
    throw new Error("No AI model configured");
  }
}
