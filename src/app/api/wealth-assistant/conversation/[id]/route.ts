import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import WealthAssistantConversation from "@/models/WealthAssistantConversation";
import WealthAssistantMessage from "@/models/WealthAssistantMessage";

export async function DELETE(
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
    const conversation = await WealthAssistantConversation.findOne({ _id: id, userId }).lean();
    if (!conversation) return NextResponse.json({ success: false, message: "Conversation not found." }, { status: 404 });

    await WealthAssistantMessage.deleteMany({ conversationId: id, userId });
    await WealthAssistantConversation.deleteOne({ _id: id, userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to discard Wealth Assistant conversation:", error);
    return NextResponse.json({ success: false, message: "Unable to discard conversation." }, { status: 500 });
  }
}