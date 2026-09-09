import { connectDB } from "@/lib/mongodb";

export default async function AdminSystemPage() {
  let database = "Unavailable";
  try { const connection = await connectDB(); database = connection.connection.readyState === 1 ? "Operational" : "Unavailable"; } catch { database = "Unavailable"; }
  const checks = [["MongoDB", database], ["Application", "Operational"], ["OpenAI", process.env.OPENAI_API_KEY ? "Configured" : "Not configured"], ["Gemini", process.env.GEMINI_API_KEY ? "Configured" : "Not configured"], ["Notifications", "Application service available"]];
  return <section className="space-y-6"><header><p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#10B981]">Operations</p><h1 className="mt-2 text-3xl font-semibold">System health</h1><p className="mt-2 text-[#7894AA]">Lightweight configuration and service checks. Secrets are never rendered.</p></header><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{checks.map(([name, status]) => <div key={name} className="rounded-2xl border border-[#1E3347] bg-[#0D1D2E] p-5"><p className="text-[#B3C5D3]">{name}</p><p className={`mt-4 font-semibold ${status === "Operational" || status === "Configured" || status === "Application service available" ? "text-[#6EE7B7]" : "text-amber-300"}`}>{status}</p></div>)}</div></section>;
}
