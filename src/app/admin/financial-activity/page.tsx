import AdminResourcePage from "../AdminResourcePage";
type Row = Record<string, unknown>;
export default function FinancialActivityPage() { return <AdminResourcePage<Row> title="Financial activity" eyebrow="Platform" description="Aggregate transaction, goal, contribution, and investment information from current records." endpoint="/api/admin/financial-activity" columns={[{ key: "metric", label: "Area" }, { key: "detail", label: "Current aggregate" }]} />; }
