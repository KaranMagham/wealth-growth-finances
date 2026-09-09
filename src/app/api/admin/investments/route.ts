import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import Investment from "@/models/Investment";
export async function GET() { const access = await requireAdmin(await headers()); if (!access.authorized) return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status }); await connectDB(); const rows = await Investment.find({}).sort({ createdAt: -1 }).limit(500).select({ name: 1, userId: 1, type: 1, totalInvested: 1, currentValue: 1, profitLoss: 1, createdAt: 1 }).lean(); return NextResponse.json({ success: true, rows: rows.map((row) => ({ _id: String(row._id), investment: row.name, user: row.userId, type: row.type, invested: row.totalInvested, currentValue: row.currentValue, profitLoss: row.profitLoss, createdAt: new Date(row.createdAt).toLocaleString() })) }); }
