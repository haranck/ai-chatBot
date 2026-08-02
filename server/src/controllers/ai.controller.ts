import { Request, Response } from "express";
import { IAIService } from "../interfaces/services/IAiService";

export class AIController {
  constructor(private readonly aiService: IAIService) {}

  async chat(req: Request, res: Response): Promise<void> {
    console.log("Entered chat controller! Message:", req.body?.message);
    try {
      const { message } = req.body;
      const reply = await this.aiService.askAI(message);
      console.log("Got reply:", reply);

      res.json({ success: true, reply });
    } catch (error: any) {
      console.error("Error in AI Controller:", error?.stack || error);
      res
        .status(500)
        .json({ success: false, error: error?.message || "Internal Server Error" });
    }
  }
}
