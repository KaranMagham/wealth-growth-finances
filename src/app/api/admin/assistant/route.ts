import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
export async function GET() { const access = await requireAdmin(await headers()); if (!access.authorized) return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status }); await connectDB(); const rows = await ActivityLog.find({ action: "WEALTH_ASSISTANT_USED" }).sort({ timestamp: -1 }).limit(500).select({ userId: 1, description: 1, timestamp: 1 }).lean(); return NextResponse.json({ success: true, rows: rows.map((row) => ({ _id: String(row._id), user: row.userId, event: row.description, provider: "Unavailable", intent: "Unavailable", outcome: "Recorded usage event", createdAt: new Date(row.timestamp).toLocaleString() })) }); }
