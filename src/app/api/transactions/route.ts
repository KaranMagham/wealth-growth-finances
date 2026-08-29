import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { TRANSACTION_TYPES } from "@/constants/transaction";
import { getAuthenticatedUserId } from "@/lib/auth-user";
import { createNotification } from "@/lib/notifications/createNotification";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();

    const query: Record<string, unknown> = { userId };

    if (
      type &&
      TRANSACTION_TYPES.includes(
        type as (typeof TRANSACTION_TYPES)[number]
      )
    ) {
      query.type = type;
    }

    if (category) {
      query.category = new RegExp(category, "i");
    }

    if (search) {
      query.$or = [
        { description: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
      ];
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, transactions },
      { status: 200 }
    );
  } catch (error) {
    console.error("List transactions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const type = body?.type;
    const amount = Number(body?.amount);
    const category =
      typeof body?.category === "string"
        ? body.category.trim()
        : "";
    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : "";
    const paymentMethod =
      typeof body?.paymentMethod === "string"
        ? body.paymentMethod.trim()
        : "Cash";
    const date = body?.date ? new Date(body.date) : new Date();

    if (
      !TRANSACTION_TYPES.includes(
        type as (typeof TRANSACTION_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please choose a valid transaction type",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount must be greater than zero",
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const transaction = await Transaction.create({
      userId,
      type,
      amount,
      category,
      description,
      paymentMethod,
      date,
    });

    // ---- Notification: large transaction ----
    const LARGE_TRANSACTION_THRESHOLD = 10000; // ₹

    if (
      transaction.type === "Expense" &&
      transaction.amount >= LARGE_TRANSACTION_THRESHOLD
    ) {
      await createNotification({
        userId,
        category: "transaction",
        severity: "WARNING",
        title: "Large transaction detected",
        message: `A transaction of ₹${transaction.amount.toLocaleString()} was recorded for ${transaction.description || transaction.category}.`,
        ruleKey: `large-transaction:${transaction._id.toString()}`,
        metadata: {
          transactionId: transaction._id.toString(),
          amount: transaction.amount,
          category: transaction.category,
          type: transaction.type,
          description: transaction.description,
          date: transaction.date,
        },
      });
    }
    // -----------------------------------------

    // ---- Payment notifications ----
    // Treat Income as "payment received"
    if (transaction.type === "Income") {
      await createNotification({
        userId,
        category: "payment",
        severity: "SUCCESS",
        title: "Payment received",
        message: `You received ₹${transaction.amount.toLocaleString()} ${transaction.description ? `for ${transaction.description}` : ""}.`,
        ruleKey: `payment-received:${transaction._id.toString()}`,
        metadata: {
          transactionId: transaction._id.toString(),
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          description: transaction.description,
        },
      });
    }

    // Optionally, treat certain expenses as "payment failed" if you have a flag.
    // For now, we'll skip failed payments unless you add a `failed` field.
    // ---------------------------------

    // ---- Low balance warning ----
    // Simple balance: total income - total expense
    const aggregates = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
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
        },
      },
    ]);

    const currentBalance =
      (aggregates[0]?.totalIncome as number) -
      (aggregates[0]?.totalExpense as number);

    const LOW_BALANCE_THRESHOLD = 5000; // ₹

    console.log("Balance check:", {
      currentBalance,
      threshold: LOW_BALANCE_THRESHOLD,
      shouldNotify: currentBalance < LOW_BALANCE_THRESHOLD,
    });

    if (currentBalance < LOW_BALANCE_THRESHOLD) {
      const todayKey = new Date().toISOString().slice(0, 10);
      console.log("Sending low balance notification");

      await createNotification({
        userId,
        category: "balance",
        severity: "WARNING",
        title: "Low balance warning",
        message: `Your balance is ₹${currentBalance.toLocaleString()}, which is below your threshold of ₹${LOW_BALANCE_THRESHOLD.toLocaleString()}.`,
        ruleKey: `low-balance:${todayKey}`,
        metadata: {
          currentBalance,
          threshold: LOW_BALANCE_THRESHOLD,
        },
      });
    }
    // -----------------------------

    return NextResponse.json(
      { success: true, transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create transaction" },
      { status: 500 }
    );
  }
}