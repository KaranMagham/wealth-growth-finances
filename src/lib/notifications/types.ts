export const NOTIFICATION_CATEGORIES = [
  "budget",
  "payment",
  "transaction",
  "balance",
  "goal",
  "weekly_summary",
  "monthly_summary",
  "investment",
  "ai_insight",
  "security",
  "system",
] as const;

export type NotificationCategory =
  (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_CHANNELS = [
  "IN_APP",
  "DESKTOP",
  "EMAIL",
] as const;

export type NotificationChannel =
  (typeof NOTIFICATION_CHANNELS)[number];

export type NotificationSeverity =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "CRITICAL";

export type ChannelPreference = {
  inApp: boolean;
  desktop: boolean;
  email: boolean;
};

export type NotificationPreferences = {
  enabled: boolean;
} & Record<
  NotificationCategory,
  ChannelPreference
>;

export type NotificationEvent = {
  userId: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  ruleKey: string;
  channels?: NotificationChannel[];
  scheduledFor?: Date;
  actionUrl?: string;
  externalTitle?: string;
  externalMessage?: string;
  metadata?: Record<string, unknown>;
};

export type NotificationProvider = {
  send(
    notification: NotificationEvent
  ): Promise<void>;
};