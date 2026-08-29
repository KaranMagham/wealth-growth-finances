import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

import {
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
} from "@/lib/notifications/types";

export type ChannelPreference = {
  inApp: boolean;
  desktop: boolean;
  email: boolean;
};

export type NotificationPreferenceDocument =
  Document & {
    userId: Types.ObjectId;
    enabled: boolean;
  } & Record<
    NotificationCategory,
    ChannelPreference
  >;

const channelPreferenceSchema =
  new Schema<ChannelPreference>(
    {
      inApp: {
        type: Boolean,
        default: true,
      },

      desktop: {
        type: Boolean,
        default: false,
      },

      email: {
        type: Boolean,
        default: false,
      },
    },
    {
      _id: false,
    }
  );

const notificationPreferenceSchema =
  new Schema<NotificationPreferenceDocument>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      enabled: {
        type: Boolean,
        default: true,
        required: true,
      },

      budget: {
        type: channelPreferenceSchema,
        default: () => ({
          inApp: true,
          desktop: false,
          email: false,
        }),
      },

      payment: {
        type: channelPreferenceSchema,
        default: () => ({
          inApp: true,
          desktop: false,
          email: false,
        }),
      },

      transaction: {
        type: channelPreferenceSchema,
        default: () => ({
          inApp: true,
          desktop: false,
          email: false,
        }),
      },

      balance: {
        type: channelPreferenceSchema,
        default: () => ({
          inApp: true,
          desktop: false,
          email: false,
        }),
      },

      goal: {
        type: channelPreferenceSchema,
        default: () => ({
          inApp: true,
          desktop: false,
          email: false,
        }),
      },

      weekly_summary: {
        type: channelPreferenceSchema,
        default: () => ({
          inApp: true,
          desktop: false,
          email: false,
        }),
      },

      monthly_summary: {
        type: channelPreferenceSchema,
        default: () => ({
          inApp: true,
          desktop: false,
          email: false,
        }),
      },

      investment: {
        type: channelPreferenceSchema,
        default: () => ({
          inApp: true,
          desktop: false,
          email: false,
        }),
      },

      ai_insight: {
        type: channelPreferenceSchema,
        default: () => ({
          inApp: true,
          desktop: false,
          email: false,
        }),
      },

      security: {
        type: channelPreferenceSchema,
        default: () => ({
          inApp: true,
          desktop: false,
          email: false,
        }),
      },

      system: {
        type: channelPreferenceSchema,
        default: () => ({
          inApp: true,
          desktop: false,
          email: false,
        }),
      },
    },
    {
      timestamps: true,
    }
  );

notificationPreferenceSchema.index(
  { userId: 1 },
  { unique: true }
);

const NotificationPreference: Model<NotificationPreferenceDocument> =
  mongoose.models.NotificationPreference ||
  mongoose.model<NotificationPreferenceDocument>(
    "NotificationPreference",
    notificationPreferenceSchema
  );

export default NotificationPreference;