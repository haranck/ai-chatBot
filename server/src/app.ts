import express from "express";
import cors from "cors";
import aiRoute from './routes/ai.routes'

const app = express();

const allowedOrigins = [
  "https://ai-chat-bot-three-neon.vercel.app",
  "http://localhost:5173",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// handle preflight for all routes
app.options("*", cors(corsOptions));

// apply CORS to all routes
app.use(cors(corsOptions));

app.use(express.json());

app.use("/api", aiRoute);

export default app;
