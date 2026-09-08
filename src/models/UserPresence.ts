import mongoose, { Schema } from "mongoose";

const UserPresenceSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    firstSeenAt: { type: Date, required: true, default: Date.now },
    lastSeenAt: { type: Date, required: true, default: Date.now, index: true },
    explicitLogoutAt: { type: Date },
    sessionEndedAt: { type: Date },
  },
  { timestamps: true }
);

UserPresenceSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

const UserPresence =
  mongoose.models.UserPresence || mongoose.model("UserPresence", UserPresenceSchema);

export default UserPresence;