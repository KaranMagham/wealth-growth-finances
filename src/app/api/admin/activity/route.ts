import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";

export async function GET(request: Request) {
  const access = await requireAdmin(await headers());
  if (!access.authorized) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status });
  }

  await connectDB();

  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 100);
  const activities = await ActivityLog.find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .select({ _id: 0, userId: 1, action: 1, description: 1, timestamp: 1 })
    .lean();

  return NextResponse.json({
    success: true,
    activities: activities.map((activity) => ({
      userId: activity.userId,
      action: activity.action,
      description: activity.description,
      timestamp: activity.timestamp,
    })),
  });
}