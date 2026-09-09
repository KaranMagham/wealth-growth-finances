import AdminResourcePage from "../AdminResourcePage";
type Row = Record<string, unknown>;
export default function AdminGoalsPage() { return <AdminResourcePage<Row> title="Goals" eyebrow="Platform" description="Monitor goal progress and completion without changing user financial data." endpoint="/api/admin/goals" columns={[{ key: "goal", label: "Goal" }, { key: "user", label: "User" }, { key: "progress", label: "Progress" }, { key: "status", label: "Status" }, { key: "targetDate", label: "Target date" }, { key: "createdAt", label: "Created" }]} />; }
