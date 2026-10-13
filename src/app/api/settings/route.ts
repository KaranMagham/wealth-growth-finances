import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import UserSettings, {
  type SettingsAiStyle,
  type SettingsToggleState,
} from "@/models/UserSettings";

type SettingsPayload = {
  notificationToggles: SettingsToggleState;
  channelToggles: SettingsToggleState;
  securityToggles: SettingsToggleState;
  currency: string;
  numberFormat: string;
  analysisPeriod: string;
  dateFormat: string;
  showDecimals: boolean;
  aiToggles: SettingsToggleState;
  aiStyle: SettingsAiStyle;
};

function isToggleState(value: unknown): value is SettingsToggleState {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === "boolean")
  );
}

function isSettingsPayload(value: unknown): value is SettingsPayload {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const payload = value as Partial<SettingsPayload>;
  return (
    isToggleState(payload.notificationToggles) &&
    isToggleState(payload.channelToggles) &&
    isToggleState(payload.securityToggles) &&
    typeof payload.currency === "string" &&
    typeof payload.numberFormat === "string" &&
    typeof payload.analysisPeriod === "string" &&
    typeof payload.dateFormat === "string" &&
    typeof payload.showDecimals === "boolean" &&
    isToggleState(payload.aiToggles) &&
    (payload.aiStyle === "Concise" ||
      payload.aiStyle === "Balanced" ||
      payload.aiStyle === "Detailed")
  );
}

async function getUserId(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user?.id ?? null;
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const settings = await UserSettings.findOne({ userId }).lean();

    return NextResponse.json({
      success: true,
      settings: settings
        ? {
            notificationToggles: settings.notificationToggles,
            channelToggles: settings.channelToggles,
            securityToggles: settings.securityToggles,
            currency: settings.currency,
            numberFormat: settings.numberFormat,
            analysisPeriod: settings.analysisPeriod,
            dateFormat: settings.dateFormat,
            showDecimals: settings.showDecimals,
            aiToggles: settings.aiToggles,
            aiStyle: settings.aiStyle,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to load user settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    if (!isSettingsPayload(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid settings payload" },
        { status: 400 }
      );
    }

    await connectDB();
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { ...body, userId },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Failed to save user settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save settings" },
      { status: 500 }
    );
  }
}
