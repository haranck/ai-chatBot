import { Router } from "express";
import { AIController } from "../controllers/ai.controller";
import { AIService } from "../services/ai.service";
import { ChatRepository } from "../repositories/chat.repository";
import { UserRepository } from "../repositories/user.repository";
import { requireAuth } from "../middleware/auth.middleware";
import { chatLimiter } from "../middleware/rateLimit.middleware";
import { groq } from "../config/ai";

const router = Router();

const chatRepo = new ChatRepository();

const aiService = new AIService(groq, chatRepo, new UserRepository());

const aiController = new AIController(aiService);

router.post("/chat", requireAuth, chatLimiter, aiController.chat.bind(aiController));

export default router;
