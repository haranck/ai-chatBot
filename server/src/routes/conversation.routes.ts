import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller";
import { ConversationService } from "../services/conversation.service";
import { ChatRepository } from "../repositories/chat.repository";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

const conversationController = new ConversationController(
  new ConversationService(new ChatRepository()),
);

router.use(requireAuth);
router.get("/", conversationController.list.bind(conversationController));
router.get("/:id/messages", conversationController.messages.bind(conversationController));
router.delete("/:id", conversationController.remove.bind(conversationController));

export default router;
