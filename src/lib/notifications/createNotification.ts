import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { resolveChannels } from "@/lib/notifications/resolveChannels";


import type {
  NotificationEvent,
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

export async function createNotification(
  input: CreateNotificationInput
) {
  await connectDB();

  const userId = toObjectId(input.userId, "userId");

  const resolvedChannels = await resolveChannels(
    userId.toString(),
    input.category
  );

  if (resolvedChannels.length === 0) {
    return null;
  }

  try {
    return await Notification.create({
      ...input,
      userId,
      channels: resolvedChannels,
      isRead: false,
    });
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
}