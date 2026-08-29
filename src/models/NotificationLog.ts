import mongoose, { Document, Schema } from "mongoose";

export interface INotificationLog extends Document {
  userId: mongoose.Types.ObjectId;
  type: "weekly_summary" | "monthly_summary";
  periodKey: string; // e.g. "2026-W35" or "2026-08"
  createdAt: Date;
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["weekly_summary", "monthly_summary"],
      required: true,
      index: true,
    },
    periodKey: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one log per user + type + period
NotificationLogSchema.index(
  { userId: 1, type: 1, periodKey: 1 },
  { unique: true }
);

const NotificationLog =
  mongoose.models.NotificationLog ||
  mongoose.model<INotificationLog>("NotificationLog", NotificationLogSchema);

export default NotificationLog;