import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
export async function GET() { const access = await requireAdmin(await headers()); if (!access.authorized) return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status }); await connectDB(); const rows = await Notification.find({}).sort({ createdAt: -1 }).limit(500).select({ userId: 1, category: 1, severity: 1, title: 1, isRead: 1, deliveredAt: 1, deliveryError: 1, createdAt: 1 }).lean(); return NextResponse.json({ success: true, rows: rows.map((row) => ({ _id: String(row._id), user: String(row.userId), title: row.title, type: row.category, severity: row.severity, status: row.deliveryError ? "Failed" : row.deliveredAt ? "Delivered" : "Pending", read: row.isRead ? "Read" : "Unread", createdAt: new Date(row.createdAt).toLocaleString() })) }); }
