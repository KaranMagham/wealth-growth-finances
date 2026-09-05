import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { createNotification } from "@/lib/notifications/createNotification";
import NotificationLog from "@/models/NotificationLog";

const CRON_API_KEY = process.env.CRON_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!CRON_API_KEY || apiKey !== CRON_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Last 7 full days
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // today 00:00
    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    // Period key: ISO week-based, e.g. "2026-W35"
    const isoWeek = getISOWeek(start);
    const periodKey = `${start.getFullYear()}-W${String(isoWeek).padStart(2, "0")}`;

    const pipeline = [
      {
        $match: {
          date: {
            $gte: start,
            $lt: end,
          },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0],
            },
          },
          transactions: { $sum: 1 },
        },
      },
    ];

    const aggregates = await Transaction.aggregate(pipeline);

    let processed = 0;
    let skipped = 0;

    for (const agg of aggregates) {
      const userId = agg._id as string | mongoose.Types.ObjectId;
      const userIdStr =
        userId instanceof mongoose.Types.ObjectId
          ? userId.toString()
          : String(userId);

      const userObjectId = new mongoose.Types.ObjectId(userIdStr);

      // Check if already sent
      const existing = await NotificationLog.findOne({
        userId: userObjectId,
        type: "weekly_summary",
        periodKey,
      });

      if (existing) {
        skipped++;
        continue;
      }

      const totalIncome = agg.totalIncome as number;
      const totalExpense = agg.totalExpense as number;
      const transactions = agg.transactions as number;

      const topCategoriesAgg = await Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: "Expense",
            date: {
              $gte: start,
              $lt: end,
            },
          },
        },
        {
          $group: {
            _id: "$category",
            amount: { $sum: "$amount" },
          },
        },
        {
          $sort: { amount: -1 },
        },
        {
          $limit: 3,
        },
      ]);

      const topCategories = topCategoriesAgg.map(
        (c) =>
          `${c._id as string} (₹${(c.amount as number).toLocaleString()})`
      );

      const title = "Your weekly money summary";
      const message =
        topCategories.length > 0
          ? `Last 7 days: Income ₹${totalIncome.toLocaleString()}, Expense ₹${totalExpense.toLocaleString()} across ${transactions} transactions. Top spends: ${topCategories.join(", ")}.`
          : `Last 7 days: Income ₹${totalIncome.toLocaleString()}, Expense ₹${totalExpense.toLocaleString()} across ${transactions} transactions.`;

      const notificationResult = await createNotification({
        userId: userIdStr,
        category: "weekly_summary",
        severity: "INFO",
        title,
        message,
        ruleKey: `weekly-summary:${periodKey}`,
        metadata: {
          periodStart: start.toISOString(),
          periodEnd: end.toISOString(),
          totalIncome,
          totalExpense,
          transactions,
          topCategories,
        },
      });

      if (!notificationResult) {
        skipped++;
        continue;
      }

      await NotificationLog.create({
          userId: userObjectId,
          type: "weekly_summary",
          periodKey,
        });

        processed++;
    }

    return NextResponse.json({
      success: true,
      processed,
      skipped,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        periodKey,
      },
    });
  } catch (error) {
    console.error("GET /api/cron/weekly-summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate weekly summaries" },
      { status: 500 }
    );
  }
}

// ISO week number helper
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}