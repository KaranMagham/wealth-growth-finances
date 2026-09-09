import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Goal from "@/models/Goal";
import Contribution from "@/models/Contribution";
import Investment from "@/models/Investment";

export async function GET() {
  const access = await requireAdmin(await headers());
  if (!access.authorized) return NextResponse.json({ success: false, message: "Forbidden" }, { status: access.status });
  await connectDB();
  const [transactions, goals, contributions, investments] = await Promise.all([
    Transaction.aggregate([{ $group: { _id: "$type", count: { $sum: 1 }, total: { $sum: "$amount" } } }]),
    Goal.aggregate([{ $group: { _id: "$completed", count: { $sum: 1 }, averageProgress: { $avg: { $cond: [{ $gt: ["$targetAmount", 0] }, { $multiply: [{ $divide: ["$currentAmount", "$targetAmount"] }, 100] }, 0] } } } }]),
    Contribution.aggregate([{ $group: { _id: "$isHistorical", count: { $sum: 1 }, total: { $sum: "$amount" } } }]),
    Investment.aggregate([{ $group: { _id: "$type", count: { $sum: 1 }, invested: { $sum: "$totalInvested" }, current: { $sum: "$currentValue" } } }]),
  ]);
  return NextResponse.json({ success: true, rows: [
    { metric: "Transactions", detail: transactions.map((item) => `${item._id}: ${item.count} (${item.total})`).join(" · ") || "None" },
    { metric: "Goals", detail: goals.map((item) => `${item._id ? "Completed" : "Active"}: ${item.count}, avg ${Math.round(item.averageProgress || 0)}%`).join(" · ") || "None" },
    { metric: "Contributions", detail: contributions.map((item) => `${item._id ? "Historical" : "Current"}: ${item.count} (${item.total})`).join(" · ") || "None" },
    { metric: "Investments", detail: investments.map((item) => `${item._id}: ${item.count}, invested ${item.invested}, current ${item.current}`).join(" · ") || "None" },
  ] });
}
