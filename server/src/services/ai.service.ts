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
    const result = await this.ai.responses.create({
      model: "openai/gpt-oss-20b",
      input: `${SYSTEM_PROMPT}\n\nUser: ${message}\nAI:`,
    });

    const answer = result.output_text?.trim() ?? "I'm sorry, I could not generate a response.";

    await this.chatRepo.saveChat("demo-user", message, answer);

    return answer;
  }
} 