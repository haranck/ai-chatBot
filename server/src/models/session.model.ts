import mongoose from "mongoose";

// One document per signed-in device/browser
const sessionSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true },
    prevTokenHash: { type: String, default: null },
    rotatedAt: { type: Date, default: null },
    userAgent: { type: String, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// MongoDB removes expired sessions automatically
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Session", sessionSchema);
