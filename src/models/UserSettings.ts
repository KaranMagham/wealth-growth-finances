import mongoose, { Document, Model, Schema } from "mongoose";

export type SettingsToggleState = Record<string, boolean>;
export type SettingsAiStyle = "Concise" | "Balanced" | "Detailed";

export type UserSettingsDocument = Document & {
  userId: string;
  notificationToggles: SettingsToggleState;
  channelToggles: SettingsToggleState;
  securityToggles: SettingsToggleState;
  currency: string;
  numberFormat: string;
  analysisPeriod: string;
  dateFormat: string;
  showDecimals: boolean;
  aiToggles: SettingsToggleState;
  aiStyle: SettingsAiStyle;
};

const toggleStateSchema = new Schema<SettingsToggleState>(
  {},
  { _id: false, strict: false }
);

const userSettingsSchema = new Schema<UserSettingsDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    notificationToggles: {
      type: toggleStateSchema,
      required: true,
    },
    channelToggles: {
      type: toggleStateSchema,
      required: true,
    },
    securityToggles: {
      type: toggleStateSchema,
      required: true,
    },
    currency: { type: String, required: true },
    numberFormat: { type: String, required: true },
    analysisPeriod: { type: String, required: true },
    dateFormat: { type: String, required: true },
    showDecimals: { type: Boolean, required: true },
    aiToggles: {
      type: toggleStateSchema,
      required: true,
    },
    aiStyle: {
      type: String,
      enum: ["Concise", "Balanced", "Detailed"],
      required: true,
    },
  },
  { timestamps: true }
);

const UserSettings: Model<UserSettingsDocument> =
  mongoose.models.UserSettings ||
  mongoose.model<UserSettingsDocument>("UserSettings", userSettingsSchema);

export default UserSettings;
