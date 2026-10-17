import { z } from "zod";

export const googleLoginSchema = z.object({
  credential: z.string({ error: "Missing Google credential" }).min(1, "Missing Google credential"),
});
