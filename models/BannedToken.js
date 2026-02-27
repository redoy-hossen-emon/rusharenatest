import mongoose from "mongoose";

const bannedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      default: "Violation",
    },
  },
  { timestamps: true }
);

export default mongoose.models.BannedToken ||
  mongoose.model("BannedToken", bannedTokenSchema);