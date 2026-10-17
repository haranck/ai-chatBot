import { Request, Response } from "express";
import { IAIService } from "../interfaces/services/IAiService";
import { AuthRequest } from "../middleware/auth.middleware";
import { chatSchema } from "../validators/chat.validator";

export class AIController {
  constructor(private readonly aiService: IAIService) {}

  async chat(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthRequest;
    const { message, conversationId } = chatSchema.parse(req.body);

    const result = await this.aiService.askAI(userId, message, conversationId ?? undefined);
    res.json({ success: true, ...result });
  }
}
