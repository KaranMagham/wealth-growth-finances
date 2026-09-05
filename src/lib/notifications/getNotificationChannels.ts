import type {
  NotificationChannel,
  NotificationCategory,
} from "./types";
import { resolveChannels } from "./resolveChannels";

export async function getNotificationChannels(
  userId: string,
  category: NotificationCategory
): Promise<NotificationChannel[]> {
  return resolveChannels(userId, category);
}