import express, { Request, Response, NextFunction } from "express";
import aiRoute from './routes/ai.routes'

const app = express();

// Manually set CORS headers on every response — works regardless of cors package version
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowed = [
    "https://ai-chat-bot-three-neon.vercel.app",
    "http://localhost:5173",
  ];

  if (!origin || allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Respond immediately to preflight
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

app.use("/api", aiRoute);

export default app;
