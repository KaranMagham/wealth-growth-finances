import { NextRequest, NextResponse } from "next/server";
import Budget from "@/models/Budget";
import Transaction from "@/models/Transaction";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

async function getUserId(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user?.id || null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const now = new Date();

    const month = Number(
      searchParams.get("month") || now.getMonth() + 1
    );

    const year = Number(
      searchParams.get("year") || now.getFullYear()
    );

    const budgets = await Budget.find({
      userId,
      month,
      year,
    }).sort({ category: 1 });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const spending = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "Expense",
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ]);

    const spendingMap = new Map(
      spending.map((item) => [item._id, item.spent])
    );

    const responseBudgets = budgets.map((budget) => {
      const spent = spendingMap.get(budget.category) || 0;
      const limit = budget.limit;
      const percentageUsed =
        limit > 0 ? Math.round((spent / limit) * 100) : 0;

      return {
        _id: budget._id,
        category: budget.category,
        limit,
        month: budget.month,
        year: budget.year,
        spent,
        remaining: limit - spent,
        percentageUsed,
      };
    });

    return NextResponse.json({
      success: true,
      budgets: responseBudgets,
    });
  } catch (error) {
    console.error("GET /api/budgets error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load budgets",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const category = String(body.category || "").trim();
    const limit = Number(body.limit);
    const month = Number(body.month);
    const year = Number(body.year);

    if (!category || !Number.isFinite(limit) || limit <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Category and a valid limit are required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid month and year are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const budget = await Budget.create({
      userId,
      category,
      limit,
      month,
      year,
    });

    return NextResponse.json(
      {
        success: true,
        budget: {
          ...budget.toObject(),
          spent: 0,
          remaining: limit,
          percentageUsed: 0,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/budgets error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A budget already exists for this category and month",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create budget",
      },
      { status: 500 }
    );
  }
}