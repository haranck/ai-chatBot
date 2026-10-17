import { z } from "zod";

export const chatSchema = z.object({
  message: z
    .string({ error: "Message is required" })
    .trim()
    .min(1, "Message cannot be empty")
    .max(8000, "Message is too long (max 8000 characters)"),
  conversationId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid conversation id")
    .nullish(),
});
