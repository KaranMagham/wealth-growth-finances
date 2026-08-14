import { NextRequest, NextResponse } from "next/server";
import Goal from "@/models/Goal";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
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

    await connectDB();

    const deletedGoal = await Goal.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deletedGoal) {
      return NextResponse.json(
        {
          success: false,
          message: "Goal not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Goal deleted",
    });
  } catch (error) {
    console.error("DELETE /api/goals/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete goal",
      },
      { status: 500 }
    );
  }
}