import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { TRANSACTION_TYPES } from "@/constants/transaction";
import { getAuthenticatedUserId } from "@/lib/auth-user";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const transaction = await Transaction.findOne({ _id: id, userId }).lean();

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction }, { status: 200 });
  } catch (error) {
    console.error("Get transaction error:", error);
    return NextResponse.json({ success: false, message: "Failed to load transaction" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const existing = await Transaction.findOne({ _id: id, userId });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    if (body?.type && !TRANSACTION_TYPES.includes(body.type as (typeof TRANSACTION_TYPES)[number])) {
      return NextResponse.json({ success: false, message: "Please choose a valid transaction type" }, { status: 400 });
    }

    if (body?.amount !== undefined) {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ success: false, message: "Amount must be greater than zero" }, { status: 400 });
      }
      existing.amount = amount;
    }

    if (body?.category !== undefined) {
      existing.category = body.category.trim();
    }

    if (body?.description !== undefined) {
      existing.description = body.description.trim();
    }

    if (body?.paymentMethod !== undefined) {
      existing.paymentMethod = body.paymentMethod.trim();
    }

    if (body?.date) {
      existing.date = new Date(body.date);
    }

    if (body?.type) {
      existing.type = body.type;
    }

    await existing.save();

    return NextResponse.json({ success: true, transaction: existing }, { status: 200 });
  } catch (error) {
    console.error("Update transaction error:", error);
    return NextResponse.json({ success: false, message: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Transaction deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete transaction" }, { status: 500 });
  }
}
