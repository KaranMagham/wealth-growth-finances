import { NextRequest, NextResponse } from "next/server";
import Goal from "@/models/Goal";
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
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const goals = await Goal.find({ userId }).sort({
      createdAt: -1,
    });

    const responseGoals = goals.map((goal) => {
      const targetAmount = goal.targetAmount;
      const currentAmount = goal.currentAmount;

      const progress =
        targetAmount > 0
          ? Math.min(
              Math.round((currentAmount / targetAmount) * 100),
              100
            )
          : 0;

      return {
        ...goal.toObject(),
        progress,
        completed: progress >= 100,
      };
    });

    return NextResponse.json({
      success: true,
      goals: responseGoals,
    });
  } catch (error) {
    console.error("GET /api/goals error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load goals",
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
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const targetAmount = Number(body.targetAmount);
    const currentAmount = Number(body.currentAmount || 0);
    const targetDate = body.targetDate;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Goal name is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Target amount must be greater than zero",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(currentAmount) ||
      currentAmount < 0 ||
      currentAmount > targetAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Current amount must be between zero and the target amount",
        },
        { status: 400 }
      );
    }

    if (!targetDate || Number.isNaN(Date.parse(targetDate))) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid target date is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const goal = await Goal.create({
      userId,
      name,
      targetAmount,
      currentAmount,
      targetDate: new Date(targetDate),
      completed: currentAmount >= targetAmount,
    });

    return NextResponse.json(
      {
        success: true,
        goal: {
          ...goal.toObject(),
          progress: Math.min(
            Math.round((currentAmount / targetAmount) * 100),
            100
          ),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/goals error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create goal",
      },
      { status: 500 }
    );
  }
}