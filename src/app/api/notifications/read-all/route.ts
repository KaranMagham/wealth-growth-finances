import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getAuthenticatedUserId } from "@/lib/notifications/getAuthenticatedUserId";

export async function PATCH(request: NextRequest) {
  try {
    const userId =
      await getAuthenticatedUserId(request);

    if (
      !userId ||
      !mongoose.isValidObjectId(userId)
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const result = await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      updatedCount: result.modifiedCount,
    });
  } catch (error: unknown) {
    console.error(
      "Failed to mark all notifications as read",
      error
    );

    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}