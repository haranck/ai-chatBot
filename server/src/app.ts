import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.routes";
import conversationRoute from "./routes/conversation.routes";
import aiRoute from "./routes/ai.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// Behind a hosting proxy (Render, etc.): use the real client IP for rate limits
app.set("trust proxy", 1);

const allowedOrigins = [
  "https://ai-chat-bot-three-neon.vercel.app",
  "http://localhost:5173",
  // optional extra origins, comma-separated (e.g. a new deploy URL)
  ...(process.env.CLIENT_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean),
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api", aiRoute);

app.use(errorHandler);

export default app;
