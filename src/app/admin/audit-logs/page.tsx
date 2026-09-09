import AdminResourcePage from "../AdminResourcePage";
type Row = Record<string, unknown>;
export default function AdminAuditLogsPage() { return <AdminResourcePage<Row> title="Audit logs" eyebrow="Operations" description="Admin actions and support events. New administrative mutations should write to this collection." endpoint="/api/admin/audit-logs" columns={[{ key: "admin", label: "Admin" }, { key: "action", label: "Action" }, { key: "target", label: "Target" }, { key: "result", label: "Result" }, { key: "createdAt", label: "Timestamp" }]} />; }
