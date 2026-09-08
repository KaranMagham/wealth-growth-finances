import mongoose, { Schema } from "mongoose";

export const ACTIVITY_ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "TRANSACTION_CREATED",
  "TRANSACTION_UPDATED",
  "TRANSACTION_DELETED",
  "GOAL_CREATED",
  "GOAL_DELETED",
  "GOAL_CONTRIBUTED",
  "BUDGET_CREATED",
  "BUDGET_DELETED",
  "INVESTMENT_CREATED",
  "INVESTMENT_UPDATED",
  "INVESTMENT_DELETED",
  "INVESTMENT_TRANSACTION_CREATED",
  "INVESTMENT_PRICE_REFRESHED",
  "REPORT_GENERATED",
  "WEALTH_ASSISTANT_USED",
] as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export const ACTIVITY_DESCRIPTIONS: Record<ActivityAction, string> = {
  LOGIN: "User logged in",
  LOGOUT: "User logged out",
  TRANSACTION_CREATED: "User created a transaction",
  TRANSACTION_UPDATED: "User edited a transaction",
  TRANSACTION_DELETED: "User deleted a transaction",
  GOAL_CREATED: "User created a financial goal",
  GOAL_DELETED: "User deleted a financial goal",
  GOAL_CONTRIBUTED: "User contributed to a goal",
  BUDGET_CREATED: "User created a budget",
  BUDGET_DELETED: "User deleted a budget",
  INVESTMENT_CREATED: "User added an investment",
  INVESTMENT_UPDATED: "User edited an investment",
  INVESTMENT_DELETED: "User deleted an investment",
  INVESTMENT_TRANSACTION_CREATED: "User recorded an investment transaction",
  INVESTMENT_PRICE_REFRESHED: "User refreshed an investment price",
  REPORT_GENERATED: "User generated a PDF report",
  WEALTH_ASSISTANT_USED: "User used the Wealth Assistant",
};

const ActivityLogSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ACTIVITY_ACTIONS,
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    metadata: {
      type: Map,
      of: String,
      default: undefined,
    },
  },
  { timestamps: true }
);

ActivityLogSchema.index(
  { userId: 1, sessionId: 1, action: 1 },
  { unique: true, partialFilterExpression: { action: "LOGIN" } }
);

const ActivityLog =
  mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);

export default ActivityLog;