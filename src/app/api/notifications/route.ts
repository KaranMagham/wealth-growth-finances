import { NextResponse } from "next/server";
import mongoose from "mongoose";

import Notification from "@/models/Notification";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

async function getAuthenticatedUserId(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user?.id ?? null;
}

export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = Number(
      searchParams.get("limit") ?? "50"
    );

    const limit = Math.min(
      Math.max(limitParam || 50, 1),
      100
    );

    await connectDB();

    const notifications = await Notification.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      notifications,
    });
  } catch (error) {
    console.error(
      "Failed to fetch notifications:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const notificationId = body?.notificationId;
    const markAll = body?.markAll === true;

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (markAll) {
      await Notification.updateMany(
        {
          userId: userObjectId,
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
      });
    }

    if (
      typeof notificationId !== "string" ||
      !mongoose.isValidObjectId(notificationId)
    ) {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 400 }
      );
    }

    const updatedNotification =
      await Notification.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(notificationId),
          userId: userObjectId,
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

    if (!updatedNotification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: updatedNotification,
    });
  } catch (error) {
    console.error(
      "Failed to update notification:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}