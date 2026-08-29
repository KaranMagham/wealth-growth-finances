import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import NotificationPreference from "@/models/NotificationPreference";
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

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    await connectDB();

    const updates = body as Record<string, unknown>;

    delete updates.userId;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const preferences =
      await NotificationPreference.findOneAndUpdate(
        { userId },
        {
          $set: updates,
          $setOnInsert: { userId },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      ).lean();

    return NextResponse.json({ preferences });
  } catch (error: unknown) {
    console.error(
      "Failed to update notification preferences",
      error
    );

    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}