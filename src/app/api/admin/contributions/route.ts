import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import Contribution from "@/models/Contribution";
export async function GET() { const access = await requireAdmin(await headers()); if (!access.authorized) return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status }); await connectDB(); const rows = await Contribution.find({}).sort({ createdAt: -1 }).limit(500).lean(); return NextResponse.json({ success: true, rows: rows.map((row) => ({ _id: String(row._id), goal: String(row.goalId), user: row.userId, amount: row.amount, note: row.note || "-", createdAt: new Date(row.createdAt).toLocaleString(), historical: row.isHistorical ? "Yes" : "No", includedInTotal: row.includedInGoalTotal ? "Yes" : "No" })) }); }
