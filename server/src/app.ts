import express from "express";
import cors from "cors";
import aiRoute from './routes/ai.routes'

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    // and any origin — adjust to a whitelist if you want stricter control
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

app.use("/api", aiRoute);

export default app;