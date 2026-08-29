import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import NotificationPreference from "@/models/NotificationPreference";
import { getAuthenticatedUserId } from "@/lib/notifications/getAuthenticatedUserId";

const allowedKeys = new Set([
  "enabled",
  "budget",
  "payment",
  "transaction",
  "balance",
  "goal",
  "weekly_summary",
  "monthly_summary",
  "investment",
  "ai_insight",
  "security",
  "system",
]);

export async function GET(request: NextRequest) {
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

    const preferences =
      await NotificationPreference.findOneAndUpdate(
        { userId },
        {
          $setOnInsert: {
            userId,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      ).lean();

    return NextResponse.json({
      preferences,
    });
  } catch (error: unknown) {
    console.error(
      "Failed to fetch notification preferences",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

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

    const updates = {
      ...(body as Record<string, unknown>),
    };

    delete updates.userId;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const invalidKeys = Object.keys(updates).filter(
      (key) => !allowedKeys.has(key)
    );

    if (invalidKeys.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid preference fields",
          fields: invalidKeys,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const preferences =
      await NotificationPreference.findOneAndUpdate(
        { userId },
        {
          $set: updates,
          $setOnInsert: {
            userId,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      ).lean();

    return NextResponse.json({
      preferences,
    });
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