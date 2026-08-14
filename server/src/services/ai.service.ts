import {OpenAI} from "openai";
import { IAIService } from "../interfaces/services/IAiService";
import { IChatRepository } from "../interfaces/repositories/IChatRepository";
import { SYSTEM_PROMPT } from "../utils/prompt";

export class AIService implements IAIService {
  constructor(
    private readonly ai: OpenAI,
    private readonly chatRepo: IChatRepository,
  ) {}

  async askAI(message: string): Promise<string> {
    const response = await this.ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });
    console.log("hello")
    const answer =
      response.choices[0]?.message?.content?.trim() ??
      "I'm sorry, I could not generate a response.";

    await this.chatRepo.saveChat("demo-user", message, answer);

    return answer;
  }
} 