import { Request, Response } from "express";
import { IConversationService } from "../interfaces/services/IConversationService";
import { AuthRequest } from "../middleware/auth.middleware";

export class ConversationController {
  constructor(private readonly conversationService: IConversationService) {}

  async list(req: Request, res: Response): Promise<void> {
    const conversations = await this.conversationService.list((req as AuthRequest).userId);
    res.json({ success: true, conversations });
  }

  async messages(req: Request, res: Response): Promise<void> {
    const { conversation, messages } = await this.conversationService.getMessages(
      (req as AuthRequest).userId,
      String(req.params.id),
    );
    res.json({ success: true, conversation, messages });
  }

  async remove(req: Request, res: Response): Promise<void> {
    await this.conversationService.remove((req as AuthRequest).userId, String(req.params.id));
    res.json({ success: true });
  }
}
