import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import WealthAssistantConversation from "@/models/WealthAssistantConversation";
import WealthAssistantMessage from "@/models/WealthAssistantMessage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const conversations = await WealthAssistantConversation.find({ userId, saveStatus: "saved" })
      .sort({ updatedAt: -1 })
      .lean();
    const counts = await WealthAssistantMessage.aggregate([
      { $match: { userId, conversationId: { $in: conversations.map((item) => item._id) } } },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } },
    ]);
    const countByConversation = new Map(counts.map((item) => [String(item._id), item.count]));

    return NextResponse.json({
      success: true,
      conversations: conversations.map((conversation) => ({
        _id: String(conversation._id),
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: countByConversation.get(String(conversation._id)) ?? 0,
      })),
    });
  } catch (error) {
    console.error("Failed to load Wealth Assistant history:", error);
    return NextResponse.json({ success: false, message: "Unable to load conversation history." }, { status: 500 });
  }
}