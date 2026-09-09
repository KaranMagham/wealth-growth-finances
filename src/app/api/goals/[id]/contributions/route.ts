import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Contribution from "@/models/Contribution";
import Goal from "@/models/Goal";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid goal" }, { status: 400 });
    }

    await connectDB();

    const goal = await Goal.findOne({ _id: id, userId }).select({ _id: 1 }).lean();
    if (!goal) {
      return NextResponse.json({ success: false, message: "Goal not found" }, { status: 404 });
    }

    const contributions = await Contribution.find({
      goalId: new mongoose.Types.ObjectId(id),
      userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, contributions });
  } catch (error) {
    console.error("GET /api/goals/[id]/contributions error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load contribution history" },
      { status: 500 }
    );
  }
}
