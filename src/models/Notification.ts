import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
} from "@/lib/notifications/types";

export const NotificationCategory = {
  BUDGET: "budget",
  PAYMENT: "payment",
  TRANSACTION: "transaction",
  BALANCE: "balance",
  GOAL: "goal",
  WEEKLY_SUMMARY: "weekly_summary",
  MONTHLY_SUMMARY: "monthly_summary",
  INVESTMENT: "investment",
  AI_INSIGHT: "ai_insight",
  SECURITY: "security",
  SYSTEM: "system",
} as const;

export type NotificationCategory =
  (typeof NotificationCategory)[keyof typeof NotificationCategory];

export const NotificationChannel = {
  IN_APP: "IN_APP",
  DESKTOP: "DESKTOP",
  EMAIL: "EMAIL",
} as const;

export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationSeverity = {
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
} as const;

export type NotificationSeverity =
  (typeof NotificationSeverity)[keyof typeof NotificationSeverity];

export const NotificationSource = {
  BUDGET: "BUDGET",
  PAYMENT: "PAYMENT",
  TRANSACTION: "TRANSACTION",
  BALANCE: "BALANCE",
  GOAL: "GOAL",
  INVESTMENT: "INVESTMENT",
  AI: "AI",
  SECURITY: "SECURITY",
  SYSTEM: "SYSTEM",
} as const;

export type NotificationSource =
  (typeof NotificationSource)[keyof typeof NotificationSource];

export type NotificationDocument = Document & {
  userId: Types.ObjectId;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  channels: NotificationChannel[];
  ruleKey: string;
  scheduledFor?: Date;
  actionUrl?: string;
  externalTitle?: string;
  externalMessage?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  deliveredAt?: Date;
  deliveryError?: string;
  createdAt: Date;
  updatedAt: Date;
};

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: NOTIFICATION_CATEGORIES,
      required: true,
      index: true,
    },

    severity: {
      type: String,
      enum: ["INFO", "SUCCESS", "WARNING", "CRITICAL"],
      required: true,
      default: "INFO",
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    channels: {
      type: [
        {
          type: String,
          enum: NOTIFICATION_CHANNELS,
        },
      ],
      required: true,
      default: ["IN_APP"],
    },

    ruleKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    scheduledFor: {
      type: Date,
    },

    actionUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    externalTitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    externalMessage: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
    },

    deliveredAt: {
      type: Date,
    },

    deliveryError: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  userId: 1,
  ruleKey: 1,
});

notificationSchema.index({
  userId: 1,
  isRead: 1,
  createdAt: -1,
});

notificationSchema.index({
  scheduledFor: 1,
});

const Notification: Model<NotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>(
    "Notification",
    notificationSchema
  );

export default Notification;