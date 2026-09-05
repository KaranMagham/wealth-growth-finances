import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import WealthAssistantConversation from "@/models/WealthAssistantConversation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    const { id } = await params;

    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, message: "Conversation not found." }, { status: 404 });

    await connectDB();
    const conversation = await WealthAssistantConversation.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status: "closed", saveStatus: "saved", updatedAt: new Date() } },
      { new: true }
    ).lean();

    if (!conversation) return NextResponse.json({ success: false, message: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error("Failed to save Wealth Assistant conversation:", error);
    return NextResponse.json({ success: false, message: "Unable to save conversation." }, { status: 500 });
  }
}