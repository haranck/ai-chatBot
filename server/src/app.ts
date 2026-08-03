import express from "express";
import cors from "cors";
import aiRoute from './routes/ai.routes';

const app = express();

const allowedOrigins = [
  "https://ai-chat-bot-three-neon.vercel.app",
  "http://localhost:5173",
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

app.use(express.json());
app.use("/api", aiRoute);

export default app;
