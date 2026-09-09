import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import Transaction from "@/models/Transaction";
import Contribution from "@/models/Contribution";
import Investment from "@/models/Investment";
import Budget from "@/models/Budget";
import ActivityLog from "@/models/ActivityLog";
import mongoose from "mongoose";
import { recordAdminAudit } from "@/lib/admin/recordAdminAudit";
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
	const access = await requireAdmin(await headers());
	if (!access.authorized) return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status });
	const { id } = await context.params;
	const connection = await connectDB();
	const database = connection.connection.db;
	if (!database) return NextResponse.json({ success: false, message: "Database unavailable" }, { status: 503 });
	const userCollection = database.collection("user");
	const user = await userCollection.findOne({ id }, { projection: { id: 1, _id: 1, name: 1, email: 1, createdAt: 1 } }) ?? (mongoose.isValidObjectId(id) ? await userCollection.findOne({ _id: new mongoose.Types.ObjectId(id) }, { projection: { id: 1, _id: 1, name: 1, email: 1, createdAt: 1 } }) : null);
	if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
	const userId = String(user.id ?? user._id);
	await recordAdminAudit({ adminId: access.userId, action: "USER_VIEWED", targetType: "user", targetId: userId, result: "success" });
	const [goals, transactions, contributions, investments, budgets, activity] = await Promise.all([Goal.countDocuments({ userId }), Transaction.countDocuments({ userId }), Contribution.countDocuments({ userId }), Investment.countDocuments({ userId }), Budget.countDocuments({ userId }), ActivityLog.find({ userId }).sort({ timestamp: -1 }).limit(25).select({ action: 1, description: 1, timestamp: 1 }).lean()]);
	return NextResponse.json({ success: true, user: { id: userId, name: user.name || null, email: user.email || null, createdAt: user.createdAt || null }, counts: { goals, transactions, contributions, investments, budgets }, activity });
}
