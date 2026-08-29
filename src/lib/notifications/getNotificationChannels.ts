import NotificationPreference from "@/models/NotificationPreference";
import type {
  ChannelPreference,
  NotificationChannel,
  NotificationCategory,
  NotificationPreferences,
} from "./types";

export async function getNotificationChannels(
  userId: string,
  category: NotificationCategory
): Promise<NotificationChannel[]> {
  const preferences =
    (await NotificationPreference.findOne({
      userId,
    }).lean()) as NotificationPreferences | null;

  if (preferences?.enabled === false) {
    return [];
  }

  const selected: ChannelPreference | undefined =
    preferences?.[category];

  const channels: NotificationChannel[] = [];

  if (selected?.inApp !== false) {
    channels.push("IN_APP");
  }

  if (selected?.desktop === true) {
    channels.push("DESKTOP");
  }

  if (selected?.email === true) {
    channels.push("EMAIL");
  }

  return channels;
}