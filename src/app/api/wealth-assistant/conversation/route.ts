import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import WealthAssistantConversation from "@/models/WealthAssistantConversation";
import WealthAssistantMessage from "@/models/WealthAssistantMessage";

export const dynamic = "force-dynamic";

async function getAuthenticatedUserId(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const conversation = await WealthAssistantConversation.create({
      userId,
      title: "New Conversation",
      status: "active",
      saveStatus: "temporary",
    });

    return NextResponse.json({ success: true, conversation }, { status: 201 });
  } catch (error) {
    console.error("Failed to create Wealth Assistant conversation:", error);
    return NextResponse.json({ success: false, message: "Unable to create conversation." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const requestedId = new URL(request.url).searchParams.get("conversationId");
    await connectDB();

    const conversation = requestedId && mongoose.isValidObjectId(requestedId)
      ? await WealthAssistantConversation.findOne({ _id: requestedId, userId }).lean()
      : null;

    if (!conversation) {
      return NextResponse.json({ success: true, conversation: null, messages: [] });
    }

    const messages = await WealthAssistantMessage.find({
      conversationId: conversation._id,
      userId,
    })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    return NextResponse.json({ success: true, conversation, messages });
  } catch (error) {
    console.error("Failed to load Wealth Assistant conversation:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load conversation history." },
      { status: 500 }
    );
  }
}