import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Goal from "@/models/Goal";
import Contribution from "@/models/Contribution";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { recordActivity } from "@/lib/activity/recordActivity";

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
    const note = typeof body.note === "string" ? body.note.trim() : undefined;
    const isHistorical = body.recordOnly === true;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Contribution must be greater than zero",
        },
        { status: 400 }
      );
    }

    if (note && note.length > 250) {
      return NextResponse.json(
        { success: false, message: "Contribution note is too long" },
        { status: 400 }
      );
    }

    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid goal" },
        { status: 400 }
      );
    }

    const dbSession = await mongoose.startSession();
    try {
      await dbSession.withTransaction(async () => {
        const goal = await Goal.findOne({ _id: id, userId }).session(dbSession);

        if (!goal) {
          throw new Error("GOAL_NOT_FOUND");
        }

        if (!isHistorical && amount > Math.max(goal.targetAmount - goal.currentAmount, 0)) {
          throw new Error("CONTRIBUTION_EXCEEDS_TARGET");
        }

        if (!isHistorical) {
          goal.currentAmount += amount;
          goal.completed = goal.currentAmount >= goal.targetAmount;
          await goal.save({ session: dbSession });
        }

        await Contribution.create([{
          goalId: goal._id,
          userId,
          amount,
          note,
          isHistorical,
          includedInGoalTotal: true,
        }], { session: dbSession });
      });
    } catch (error) {
      if (error instanceof Error && error.message === "GOAL_NOT_FOUND") {
        return NextResponse.json(
          { success: false, message: "Goal not found" },
          { status: 404 }
        );
      }

      if (error instanceof Error && error.message === "CONTRIBUTION_EXCEEDS_TARGET") {
        return NextResponse.json(
          { success: false, message: "Contribution cannot exceed the remaining goal amount" },
          { status: 400 }
        );
      }

      throw error;
    } finally {
      await dbSession.endSession();
    }

    const savedGoal = await Goal.findOne({ _id: id, userId });
    const savedContribution = await Contribution.findOne({
      goalId: id,
      userId,
    }).sort({ createdAt: -1 });

    if (!savedGoal || !savedContribution) {
      return NextResponse.json(
        { success: false, message: "Unable to create contribution" },
        { status: 500 }
      );
    }

    await recordActivity({ userId, sessionId: session.session.id, action: "GOAL_CONTRIBUTED" });

    const progress =
      savedGoal.targetAmount > 0
        ? Math.min(
            Math.round(
              (savedGoal.currentAmount / savedGoal.targetAmount) * 100
            ),
            100
          )
        : 0;

    return NextResponse.json({
      success: true,
      goal: {
        ...savedGoal.toObject(),
        progress,
      },
      contribution: savedContribution,
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