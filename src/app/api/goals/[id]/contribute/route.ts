import { NextRequest, NextResponse } from "next/server";
import Goal from "@/models/Goal";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Contribution must be greater than zero",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const goal = await Goal.findOne({
      _id: id,
      userId,
    });

    if (!goal) {
      return NextResponse.json(
        {
          success: false,
          message: "Goal not found",
        },
        { status: 404 }
      );
    }

    goal.currentAmount = Math.min(
      goal.currentAmount + amount,
      goal.targetAmount
    );

    goal.completed =
      goal.currentAmount >= goal.targetAmount;

    await goal.save();

    const progress =
      goal.targetAmount > 0
        ? Math.min(
            Math.round(
              (goal.currentAmount / goal.targetAmount) * 100
            ),
            100
          )
        : 0;

    return NextResponse.json({
      success: true,
      goal: {
        ...goal.toObject(),
        progress,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/goals/[id]/contribute error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to add contribution",
      },
      { status: 500 }
    );
  }
}