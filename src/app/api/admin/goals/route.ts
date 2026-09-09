import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import Goal from "@/models/Goal";
export async function GET() { const access = await requireAdmin(await headers()); if (!access.authorized) return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status }); await connectDB(); const rows = await Goal.find({}).sort({ createdAt: -1 }).limit(500).select({ name: 1, userId: 1, targetAmount: 1, currentAmount: 1, completed: 1, targetDate: 1, createdAt: 1 }).lean(); return NextResponse.json({ success: true, rows: rows.map((row) => ({ _id: String(row._id), goal: row.name, user: row.userId, progress: row.targetAmount ? `${Math.min(Math.round((row.currentAmount / row.targetAmount) * 100), 100)}%` : "0%", status: row.completed ? "Completed" : "Active", targetDate: new Date(row.targetDate).toLocaleDateString(), createdAt: new Date(row.createdAt).toLocaleString() })) }); }
