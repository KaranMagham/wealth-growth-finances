import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Notification, {
  type NotificationDocument,
} from "@/models/Notification";
import { resolveChannels } from "@/lib/notifications/resolveChannels";
import { NovuProvider } from "./providers/NovuProvider";

import type {
  NotificationEvent,
  NotificationChannel,
} from "@/lib/notifications/types";

type CreateNotificationInput = Omit<
  NotificationEvent,
  "userId" | "channels"
> & {
  userId: string | mongoose.Types.ObjectId;
  channels?: NotificationEvent["channels"];
};

function toObjectId(
  value: string | mongoose.Types.ObjectId,
  fieldName: string
): mongoose.Types.ObjectId {
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  if (!mongoose.isValidObjectId(value)) {
    throw new Error(
      `${fieldName} must be a valid MongoDB ObjectId`
    );
  }

  return new mongoose.Types.ObjectId(value);
}

const novu = new NovuProvider();

export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationDocument | null> {
  await connectDB();

  const userId = toObjectId(input.userId, "userId");
  const userIdStr = userId.toString();

  const resolvedChannels = await resolveChannels(
    userIdStr,
    input.category
  );

  if (resolvedChannels.length === 0) {
    return null;
  }

  // Create in-app notification
  let doc: NotificationDocument | null = null;

  try {
    const created = await Notification.create({
      ...input,
      userId,
      channels: resolvedChannels,
      isRead: false,
    });

    // Normalize: Mongoose may type create() as T | T[]
    doc = (Array.isArray(created) ? created[0] : created) as NotificationDocument;
  } catch (error: unknown) {
    if (
      error !== null &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return null;
    }
    throw error;
  }

  // Send to Novu if EMAIL or DESKTOP is enabled
  const novuChannels: NotificationChannel[] = [];
  if (resolvedChannels.includes("EMAIL")) {
    novuChannels.push("EMAIL");
  }
  if (resolvedChannels.includes("DESKTOP")) {
    novuChannels.push("DESKTOP");
  }

  if (novuChannels.length > 0) {
    const novuEvent: NotificationEvent = {
      ...input,
      userId: userIdStr,
      channels: novuChannels,
    };

    novu.send(novuEvent).catch((err) => {
      console.error("Novu send error:", err);
    });
  }

  return doc;
}