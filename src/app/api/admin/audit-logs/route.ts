import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import AdminAuditLog from "@/models/AdminAuditLog";
export async function GET() { const access = await requireAdmin(await headers()); if (!access.authorized) return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status }); await connectDB(); const rows = await AdminAuditLog.find({}).sort({ createdAt: -1 }).limit(500).lean(); return NextResponse.json({ success: true, rows: rows.map((row) => ({ _id: String(row._id), admin: row.adminId, action: row.action, target: `${row.targetType}${row.targetId ? ` · ${row.targetId}` : ""}`, result: row.result, createdAt: new Date(row.createdAt).toLocaleString() })) }); }
