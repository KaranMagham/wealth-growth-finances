import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { TRANSACTION_TYPES } from "@/constants/transaction";
import { getAuthenticatedUserId } from "@/lib/auth-user";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();

    const query: Record<string, unknown> = { userId };

    if (type && TRANSACTION_TYPES.includes(type as (typeof TRANSACTION_TYPES)[number])) {
      query.type = type;
    }

    if (category) {
      query.category = new RegExp(category, "i");
    }

    if (search) {
      query.$or = [
        { description: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
      ];
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, transactions }, { status: 200 });
  } catch (error) {
    console.error("List transactions error:", error);
    return NextResponse.json({ success: false, message: "Failed to load transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const type = body?.type;
    const amount = Number(body?.amount);
    const category = typeof body?.category === "string" ? body.category.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const paymentMethod = typeof body?.paymentMethod === "string" ? body.paymentMethod.trim() : "Cash";
    const date = body?.date ? new Date(body.date) : new Date();

    if (!TRANSACTION_TYPES.includes(type as (typeof TRANSACTION_TYPES)[number])) {
      return NextResponse.json({ success: false, message: "Please choose a valid transaction type" }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: "Amount must be greater than zero" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ success: false, message: "Category is required" }, { status: 400 });
    }

    await connectDB();

    const transaction = await Transaction.create({
      userId,
      type,
      amount,
      category,
      description,
      paymentMethod,
      date,
    });

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json({ success: false, message: "Failed to create transaction" }, { status: 500 });
  }
}
