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

  const connection = await connectDB();
  const database = connection.connection.db;
  if (!database) {
    return NextResponse.json(
      { success: false, message: "Database unavailable" },
      { status: 503 }
    );
  }

  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 100);
  const activities = await ActivityLog.find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .select({ _id: 0, userId: 1, action: 1, description: 1, timestamp: 1 })
    .lean();

  const users = await database
    .collection<{ id?: string; _id: unknown; name?: string; email?: string }>("user")
    .find({}, { projection: { _id: 1, id: 1, name: 1, email: 1 } })
    .limit(500)
    .toArray();

  const userById = new Map<string, { name: string | null; email: string | null }>();
  for (const user of users) {
    const userId = String(user.id ?? user._id);
    userById.set(userId, {
      name: typeof user.name === "string" ? user.name : null,
      email: typeof user.email === "string" ? user.email : null,
    });
  }

  return NextResponse.json({
    success: true,
    activities: activities.map((activity) => ({
      userId: activity.userId,
      userName: userById.get(activity.userId)?.name ?? null,
      userEmail: userById.get(activity.userId)?.email ?? null,
      action: activity.action,
      description: activity.description,
      timestamp: activity.timestamp,
    })),
  });
}