import { NextRequest, NextResponse } from "next/server";
import Goal from "@/models/Goal";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications/createNotification";

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

    const responseGoals = await Promise.all(
      goals.map(async (goal) => {
        const targetAmount = goal.targetAmount as number;
        const currentAmount = goal.currentAmount as number;

        const progress =
          targetAmount > 0
            ? Math.min(
                Math.round((currentAmount / targetAmount) * 100),
                100
              )
            : 0;

        // ---- Goal milestone notifications ----
        const MILESTONES = [50, 100];

        for (const milestone of MILESTONES) {
          if (progress >= milestone && progress < milestone + 1) {
            await createNotification({
              userId,
              category: "goal",
              severity: milestone === 100 ? "SUCCESS" : "INFO",
              title:
                milestone === 100
                  ? "Goal completed"
                  : "Goal milestone reached",
              message:
                milestone === 100
                  ? `You've fully funded your goal: ${goal.name}.`
                  : `You've reached ${milestone}% of your goal: ${goal.name}.`,
              ruleKey: `goal-milestone:${goal._id.toString()}:${milestone}`,
              metadata: {
                goalId: goal._id.toString(),
                name: goal.name,
                targetAmount,
                currentAmount,
                progress,
                milestone,
              },
            });
          }
        }
        // --------------------------------------

        return {
          ...goal.toObject(),
          progress,
          completed: progress >= 100,
        };
      })
    );

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