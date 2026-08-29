import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getAuthenticatedUserId } from "@/lib/notifications/getAuthenticatedUserId";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    const { id } = await context.params;

    if (
      !userId ||
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(id)
    ) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    await connectDB();

    const notificationId =
      new mongoose.Types.ObjectId(id);

    const authenticatedUserId =
      new mongoose.Types.ObjectId(userId);

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          userId: authenticatedUserId,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        },
        {
          new: true,
        }
      ).lean();

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      notification,
    });
  } catch (error: unknown) {
    console.error(
      "Failed to mark notification as read",
      error
    );

    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}