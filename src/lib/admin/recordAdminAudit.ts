import AdminAuditLog from "@/models/AdminAuditLog";
import { connectDB } from "@/lib/mongodb";

export async function recordAdminAudit(input: {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string;
  result: "success" | "failure";
  metadata?: Record<string, string>;
}) {
  try {
    await connectDB();
    await AdminAuditLog.create(input);
  } catch (error) {
    console.error("Admin audit log error:", error);
  }
}
