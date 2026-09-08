import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import { PRESENCE_TIMEOUT_MS } from "@/lib/presence/updatePresence";
import ActivityLog from "@/models/ActivityLog";
import UserPresence from "@/models/UserPresence";

type PresenceRecord = {
  userId: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  explicitLogoutAt?: Date;
  sessionEndedAt?: Date;
};

type UserRecord = {
  _id: unknown;
  id?: string;
  name?: string;
  email?: string;
  createdAt?: Date;
};

export async function GET() {
  const access = await requireAdmin(await headers());
  if (!access.authorized) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status });
  }

  const connection = await connectDB();
  const database = connection.connection.db;
  if (!database) {
    return NextResponse.json({ success: false, message: "Database unavailable" }, { status: 503 });
  }

  const now = Date.now();
  const onlineSince = new Date(now - PRESENCE_TIMEOUT_MS);
  const recentSince = new Date(now - 24 * 60 * 60 * 1000);
  const userCollection = database.collection<UserRecord>("user");
  const [totalUsers, users, presences, logins] = await Promise.all([
    userCollection.countDocuments(),
    userCollection.find({}, { projection: { _id: 1, id: 1, name: 1, email: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(500).toArray(),
    UserPresence.find({ lastSeenAt: { $gte: recentSince } }).sort({ lastSeenAt: -1 }).lean<PresenceRecord[]>(),
    ActivityLog.find({ action: "LOGIN" }).sort({ timestamp: -1 }).select({ _id: 0, userId: 1, timestamp: 1 }).limit(5000).lean(),
  ]);

  const latestByUser = new Map<string, (typeof presences)[number]>();
  for (const presence of presences) {
    if (!latestByUser.has(presence.userId)) latestByUser.set(presence.userId, presence);
  }

  const onlineUserIds = new Set(
    presences
      .filter((presence) => presence.lastSeenAt >= onlineSince && !presence.explicitLogoutAt && !presence.sessionEndedAt)
      .map((presence) => presence.userId)
  );
  const lastLoginByUser = new Map<string, Date>();
  for (const login of logins) {
    if (!lastLoginByUser.has(login.userId)) lastLoginByUser.set(login.userId, login.timestamp);
  }

  const safeUsers = users.map((user) => {
    const userId = String(user.id ?? user._id);
    const presence = latestByUser.get(userId);
    const lastSeenAt = presence?.lastSeenAt ?? null;
    const sessionStartedAt = presence?.firstSeenAt ?? null;
    return {
      id: userId,
      name: typeof user.name === "string" ? user.name : null,
      email: typeof user.email === "string" ? user.email : null,
      createdAt: user.createdAt ?? null,
      lastLoginAt: lastLoginByUser.get(userId) ?? null,
      online: onlineUserIds.has(userId),
      lastSeenAt,
      lastLogoutAt: presence?.explicitLogoutAt ?? null,
      sessionStartedAt,
      sessionDurationMs: sessionStartedAt && lastSeenAt
        ? Math.max(0, new Date(lastSeenAt).getTime() - new Date(sessionStartedAt).getTime())
        : null,
    };
  });

  return NextResponse.json({
    success: true,
    summary: {
      totalUsers,
      onlineUsers: onlineUserIds.size,
      offlineUsers: Math.max(0, totalUsers - onlineUserIds.size),
      recentlyActiveUsers: safeUsers.filter((user) => user.lastSeenAt !== null).length,
    },
    users: safeUsers,
  });
}