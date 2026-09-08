import { connectDB } from "@/lib/mongodb";
import ActivityLog, {
  ACTIVITY_DESCRIPTIONS,
  type ActivityAction,
} from "@/models/ActivityLog";

type SafeMetadata = Record<string, string>;

export async function recordActivity(input: {
  userId: string;
  sessionId: string;
  action: ActivityAction;
  metadata?: SafeMetadata;
}) {
  try {
    await connectDB();

    await ActivityLog.create({
      userId: input.userId,
      sessionId: input.sessionId,
      action: input.action,
      description: ACTIVITY_DESCRIPTIONS[input.action],
      timestamp: new Date(),
      metadata: input.metadata,
    });
  } catch (error) {
    console.error("Activity log error:", error);
  }
}

export async function recordLoginOnce(userId: string, sessionId: string) {
  try {
    await connectDB();

    await ActivityLog.updateOne(
      { userId, sessionId, action: "LOGIN" },
      {
        $setOnInsert: {
          userId,
          sessionId,
          action: "LOGIN",
          description: ACTIVITY_DESCRIPTIONS.LOGIN,
          timestamp: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Login activity error:", error);
  }
}