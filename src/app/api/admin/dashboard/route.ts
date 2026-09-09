import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import Contribution from "@/models/Contribution";
import Transaction from "@/models/Transaction";
import Investment from "@/models/Investment";
import ActivityLog from "@/models/ActivityLog";
import UserPresence from "@/models/UserPresence";
import { PRESENCE_TIMEOUT_MS } from "@/lib/presence/updatePresence";

export async function GET() {
  const access = await requireAdmin(await headers());
  if (!access.authorized) return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status });

  const connection = await connectDB();
  const database = connection.connection.db;
  if (!database) return NextResponse.json({ success: false, message: "Database unavailable" }, { status: 503 });

  const userCollection = database.collection("user");
  const [totalUsers, newUsers, activeUsers, totalTransactions, transactionTotals, totalGoals, goalStatus, totalContributions, contributionTotals, totalInvestments, assistantQueries] = await Promise.all([
    userCollection.countDocuments(),
    userCollection.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    UserPresence.distinct("userId", { lastSeenAt: { $gte: new Date(Date.now() - PRESENCE_TIMEOUT_MS) }, explicitLogoutAt: { $exists: false }, sessionEndedAt: { $exists: false } }).then((ids) => ids.length),
    Transaction.countDocuments(),
    Transaction.aggregate<{ _id: string; total: number }>([{ $group: { _id: "$type", total: { $sum: "$amount" } } }]),
    Goal.countDocuments(),
    Goal.aggregate<{ _id: boolean; count: number }>([{ $group: { _id: "$completed", count: { $sum: 1 } } }]),
    Contribution.countDocuments(),
    Contribution.aggregate<{ _id: null; total: number; historical: number }>([{ $group: { _id: null, total: { $sum: "$amount" }, historical: { $sum: { $cond: ["$isHistorical", 1, 0] } } } }]),
    Investment.countDocuments(),
    ActivityLog.countDocuments({ action: "WEALTH_ASSISTANT_USED" }),
  ]);

  const income = transactionTotals.find((item) => item._id === "Income")?.total ?? 0;
  const expenses = transactionTotals.find((item) => item._id === "Expense")?.total ?? 0;
  const activeGoals = goalStatus.find((item) => item._id === false)?.count ?? 0;
  const completedGoals = goalStatus.find((item) => item._id === true)?.count ?? 0;
  const contributionSummary = contributionTotals[0] ?? { total: 0, historical: 0 };

  return NextResponse.json({
    success: true,
    stats: {
      totalUsers,
      newUsers,
      activeUsers,
      totalTransactions,
      totalGoals,
      activeGoals,
      completedGoals,
      totalContributions,
      contributionAmount: contributionSummary.total,
      historicalContributions: contributionSummary.historical,
      totalInvestments,
      assistantQueries,
      income,
      expenses,
    },
    availability: {
      activeUsers: "Currently online users from the existing presence heartbeat; historical active-user analytics are not persisted.",
      assistantTelemetry: "Only assistant activity count is persisted; provider, latency, fallback, and intent telemetry are unavailable.",
      errorMonitoring: "No persistent application error store is currently configured.",
    },
  });
}
