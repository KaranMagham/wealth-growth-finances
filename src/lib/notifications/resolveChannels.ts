import NotificationPreference from "@/models/NotificationPreference";
import type {
  NotificationChannel,
  NotificationCategory,
} from "./types";

type PreferenceChannels = {
  inApp: boolean;
  desktop: boolean;
  email: boolean;
};

type PreferenceDocument = {
  enabled?: boolean;
  [key: string]: unknown;
};

export async function resolveChannels(
  userId: string,
  category: NotificationCategory
): Promise<NotificationChannel[]> {
  const preferences =
    (await NotificationPreference.findOne({
      userId,
    }).lean()) as PreferenceDocument | null;

  if (preferences?.enabled === false) {
    return [];
  }

  const selected = preferences?.[category] as
    | PreferenceChannels
    | undefined;

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