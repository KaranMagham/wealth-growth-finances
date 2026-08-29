import Notification from "@/models/Notification";
import NotificationPreference from "@/models/NotificationPreference";

import type {
  ChannelPreference,
  NotificationChannel,
  NotificationEvent,
  NotificationPreferences,
} from "./types";

import { NovuProvider } from "./providers/NovuProvider";

const novuProvider = new NovuProvider();

function selectChannels(
  event: NotificationEvent,
  preferences: NotificationPreferences | null
): NotificationChannel[] {
  if (preferences?.enabled === false) {
    return [];
  }

  const selected:
    | ChannelPreference
    | undefined = preferences?.[event.category];

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

export async function createNotification(
  event: NotificationEvent
) {
  const preferences =
    (await NotificationPreference.findOne({
      userId: event.userId,
    }).lean()) as NotificationPreferences | null;

  const channels = selectChannels(
    event,
    preferences
  );

  if (channels.length === 0) {
    return {
      created: false,
      duplicate: false,
      skipped: true,
    };
  }

  try {
    const notification = await Notification.create({
      ...event,
      channels,
      isRead: false,
    });

    const requiresExternalDelivery =
      channels.includes("EMAIL") ||
      channels.includes("DESKTOP");

    if (requiresExternalDelivery) {
      try {
        await novuProvider.send({
          ...event,
          channels,
        });

        await Notification.updateOne(
          { _id: notification._id },
          {
            $set: {
              deliveredAt: new Date(),
            },
            $unset: {
              deliveryError: 1,
            },
          }
        );
      } catch (error: unknown) {
        const deliveryError =
          error instanceof Error
            ? error.message
            : "External delivery failed";

        await Notification.updateOne(
          { _id: notification._id },
          {
            $set: {
              deliveryError,
            },
          }
        );
      }
    }

    return {
      created: true,
      duplicate: false,
      skipped: false,
      notification,
    };
  } catch (error: unknown) {
    if (
      error !== null &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return {
        created: false,
        duplicate: true,
        skipped: false,
      };
    }

    throw error;
  }
}