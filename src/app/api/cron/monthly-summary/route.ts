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

    // Last full calendar month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const periodKey = `${year}-${String(month - 1 + 1).padStart(2, "0")}`; // "2026-08", etc.

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

      const existing = await NotificationLog.findOne({
        userId: userObjectId,
        type: "monthly_summary",
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

      const monthLabel = start.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      });

      const title = `Your ${monthLabel} summary`;
      const message =
        topCategories.length > 0
          ? `${monthLabel}: Income ₹${totalIncome.toLocaleString()}, Expense ₹${totalExpense.toLocaleString()} across ${transactions} transactions. Top spends: ${topCategories.join(", ")}.`
          : `${monthLabel}: Income ₹${totalIncome.toLocaleString()}, Expense ₹${totalExpense.toLocaleString()} across ${transactions} transactions.`;

      const notificationResult = await createNotification({
        userId: userIdStr,
        category: "monthly_summary",
        severity: "INFO",
        title,
        message,
        ruleKey: `monthly-summary:${periodKey}`,
        metadata: {
          periodStart: start.toISOString(),
          periodEnd: end.toISOString(),
          year,
          month: month, // 0-based
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
          type: "monthly_summary",
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
    console.error("GET /api/cron/monthly-summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate monthly summaries" },
      { status: 500 }
    );
  }
}