import { connectDB } from "@/lib/mongodb";
import UserPresence from "@/models/UserPresence";
import { recordLoginOnce } from "@/lib/activity/recordActivity";

export const PRESENCE_TIMEOUT_MS = 90_000;

export async function updatePresence(userId: string, sessionId: string) {
  await connectDB();

  const now = new Date();
  const endedPresence = (await UserPresence.findOne({ userId, sessionId })
    .select({ explicitLogoutAt: 1 })
    .lean()
    .exec()) as { explicitLogoutAt?: Date } | null;
  if (endedPresence?.explicitLogoutAt) return endedPresence;

  const presence = await UserPresence.findOneAndUpdate(
    { userId, sessionId },
    {
      $set: { lastSeenAt: now },
      $setOnInsert: { firstSeenAt: now },
    },
    { upsert: true, new: true }
  ).lean();

  await recordLoginOnce(userId, sessionId);

  return presence;
}

export async function endPresence(userId: string, sessionId: string) {
  try {
    await connectDB();

    const now = new Date();
    await UserPresence.updateOne(
      { userId, sessionId },
      { $set: { explicitLogoutAt: now, sessionEndedAt: now, lastSeenAt: now } }
    );
  } catch (error) {
    console.error("Presence end error:", error);
  }
}