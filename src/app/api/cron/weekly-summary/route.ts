import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { createNotification } from "@/lib/notifications/createNotification";

// Simple API key check for cron security
const CRON_API_KEY = process.env.CRON_API_KEY;

export async function GET(request: NextRequest) {
  try {
    // Basic auth for cron endpoint
    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!CRON_API_KEY || apiKey !== CRON_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Date range: last 7 full days (you can adjust as needed)
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // today 00:00
    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    // Aggregate per user
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

    for (const agg of aggregates) {
      const userId = agg._id as string | mongoose.Types.ObjectId;
      const userIdStr =
        userId instanceof mongoose.Types.ObjectId
          ? userId.toString()
          : String(userId);

      const totalIncome = agg.totalIncome as number;
      const totalExpense = agg.totalExpense as number;
      const transactions = agg.transactions as number;

      // Optional: top categories for expenses
      const topCategoriesAgg = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userIdStr),
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

      await createNotification({
        userId: userIdStr,
        category: "weekly_summary",
        severity: "INFO",
        title,
        message,
        ruleKey: `weekly-summary:${start.toISOString().slice(0, 10)}`,
        metadata: {
          periodStart: start.toISOString(),
          periodEnd: end.toISOString(),
          totalIncome,
          totalExpense,
          transactions,
          topCategories,
        },
      });

      processed++;
    }

    return NextResponse.json({
      success: true,
      processed,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
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