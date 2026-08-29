import { NextResponse } from "next/server";
import mongoose from "mongoose";

import NotificationPreference from "@/models/NotificationPreference";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import type { ChannelPreference } from "@/lib/notifications/types";

async function getAuthenticatedUserId(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user?.id ?? null;
}

type PreferencesBody = {
  enabled?: boolean;
  budget?: Partial<ChannelPreference>;
  payment?: Partial<ChannelPreference>;
  transaction?: Partial<ChannelPreference>;
  balance?: Partial<ChannelPreference>;
  goal?: Partial<ChannelPreference>;
  weekly_summary?: Partial<ChannelPreference>;
  monthly_summary?: Partial<ChannelPreference>;
  investment?: Partial<ChannelPreference>;
  ai_insight?: Partial<ChannelPreference>;
  security?: Partial<ChannelPreference>;
  system?: Partial<ChannelPreference>;
};

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

    await connectDB();

    const preferences =
      await NotificationPreference.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      }).lean();

    if (!preferences) {
      return NextResponse.json({
        preferences: null,
      });
    }

    return NextResponse.json({
      preferences,
    });
  } catch (error) {
    console.error(
      "Failed to fetch notification preferences:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    const body = (await request.json()) as PreferencesBody;

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const normalizeChannel = (
      input: Partial<ChannelPreference> | undefined,
      defaults: ChannelPreference = { inApp: true, desktop: false, email: false }
    ): ChannelPreference => ({
      inApp: typeof input?.inApp === "boolean" ? input.inApp : defaults.inApp,
      desktop:
        typeof input?.desktop === "boolean" ? input.desktop : defaults.desktop,
      email: typeof input?.email === "boolean" ? input.email : defaults.email,
    });

    const update = {
      userId: userObjectId,
      enabled: typeof body.enabled === "boolean" ? body.enabled : true,
      budget: normalizeChannel(body.budget),
      payment: normalizeChannel(body.payment),
      transaction: normalizeChannel(body.transaction),
      balance: normalizeChannel(body.balance),
      goal: normalizeChannel(body.goal),
      weekly_summary: normalizeChannel(body.weekly_summary),
      monthly_summary: normalizeChannel(body.monthly_summary),
      investment: normalizeChannel(body.investment),
      ai_insight: normalizeChannel(body.ai_insight),
      security: normalizeChannel(body.security),
      system: normalizeChannel(body.system),
    };

    const preferences =
      await NotificationPreference.findOneAndUpdate(
        {
          userId: userObjectId,
        },
        update,
        {
          upsert: true,
          new: true,
        }
      ).lean();

    return NextResponse.json({
      preferences,
    });
  } catch (error) {
    console.error(
      "Failed to update notification preferences:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}