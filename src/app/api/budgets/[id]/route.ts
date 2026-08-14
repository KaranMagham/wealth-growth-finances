import { NextRequest, NextResponse } from "next/server";
import Budget from "@/models/Budget";
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    await connectDB();

    const deletedBudget = await Budget.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deletedBudget) {
      return NextResponse.json(
        {
          success: false,
          message: "Budget not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Budget deleted",
    });
  } catch (error) {
    console.error("DELETE /api/budgets/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete budget",
      },
      { status: 500 }
    );
  }
}