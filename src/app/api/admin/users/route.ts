import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import Transaction from "@/models/Transaction";
import Contribution from "@/models/Contribution";
import Investment from "@/models/Investment";

export async function GET(request: NextRequest) {
  const access = await requireAdmin(await headers());
  if (!access.authorized) return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status });
  const connection = await connectDB();
  const database = connection.connection.db;
  if (!database) return NextResponse.json({ success: false, message: "Database unavailable" }, { status: 503 });
  const params = request.nextUrl.searchParams;
  const page = Math.max(Number(params.get("page")) || 1, 1);
  const limit = Math.min(Math.max(Number(params.get("limit")) || 25, 1), 100);
  const search = params.get("search")?.trim();
  const filter = search ? ({ $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] } as never) : {};
  const userCollection = database.collection("user");
  const [total, users] = await Promise.all([
    userCollection.countDocuments(filter),
    userCollection.find(filter, { projection: { _id: 1, id: 1, name: 1, email: 1, createdAt: 1 } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
  ]);
  const rows = await Promise.all(users.map(async (user) => {
    const userId = String(user.id ?? user._id);
    const [goals, transactions, contributions, investments] = await Promise.all([
      Goal.countDocuments({ userId }), Transaction.countDocuments({ userId }), Contribution.countDocuments({ userId }), Investment.countDocuments({ userId }),
    ]);
    return { _id: userId, user: user.name || "Unnamed user", email: user.email || "-", createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-", goals, transactions, contributions, investments };
  }));
  return NextResponse.json({ success: true, rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}
