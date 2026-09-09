import mongoose, { Schema } from "mongoose";

const AdminAuditLogSchema = new Schema(
  {
    adminId: { type: String, required: true, index: true },
    action: { type: String, required: true, trim: true, index: true },
    targetType: { type: String, required: true, trim: true },
    targetId: { type: String, trim: true },
    result: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true }
);

AdminAuditLogSchema.index({ createdAt: -1 });

const AdminAuditLog = mongoose.models.AdminAuditLog || mongoose.model("AdminAuditLog", AdminAuditLogSchema);
export default AdminAuditLog;
