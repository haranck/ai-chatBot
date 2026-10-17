import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../repositories/session.repository";
import { requireAuth } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";
import { authConfig } from "../config/auth";

const router = Router();

const authService = new AuthService(
  new OAuth2Client(authConfig.googleClientId),
  new UserRepository(),
  new SessionRepository(),
);

const authController = new AuthController(authService);

router.use(authLimiter);
router.post("/google", authController.google.bind(authController));
router.post("/refresh", authController.refresh.bind(authController));
router.post("/logout", authController.logout.bind(authController));
router.get("/me", requireAuth, authController.me.bind(authController));

export default router;
