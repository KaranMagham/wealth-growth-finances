"use client";

import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, Bot, CircleDollarSign, Goal, ReceiptText, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type DashboardStats = {
  totalUsers: number;
  newUsers: number;
  activeUsers: number | null;
  totalTransactions: number;
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalContributions: number;
  contributionAmount: number;
  historicalContributions: number;
  totalInvestments: number;
  assistantQueries: number;
  income: number;
  expenses: number;
};

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function StatCard({ label, value, detail, icon: Icon, accent = "emerald" }: { label: string; value: string; detail: string; icon: LucideIcon; accent?: "emerald" | "sky" | "amber" | "violet" }) {
  const colors = { emerald: "text-[#6EE7B7] bg-[#10B981]/10", sky: "text-sky-300 bg-sky-400/10", amber: "text-amber-300 bg-amber-400/10", violet: "text-violet-300 bg-violet-400/10" };
  return <div className="rounded-2xl border border-[#1E3347] bg-[#0D1D2E] p-5"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[accent]}`}><Icon className="h-5 w-5" /></div><p className="mt-5 text-sm text-[#7894AA]">{label}</p><p className="mt-1 text-2xl font-semibold text-white">{value}</p><p className="mt-2 text-xs text-[#5D7890]">{detail}</p></div>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [availability, setAvailability] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load dashboard");
        setStats(data.stats);
        setAvailability(data.availability || {});
      })
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard"));
  }, []);

  if (error) return <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-6 text-rose-200">{error}</div>;
  if (!stats) return <div className="space-y-6 animate-pulse"><div className="h-12 w-64 rounded bg-[#102437]" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-40 rounded-2xl bg-[#0D1D2E]" />)}</div></div>;

  return <div className="space-y-8">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#10B981]">Platform overview</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin dashboard</h1><p className="mt-2 text-[#7894AA]">A focused view of Wealth Growth activity and operational health.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#1E6B55] bg-[#10B981]/10 px-3 py-1.5 text-xs font-semibold text-[#6EE7B7]"><Activity className="h-3.5 w-3.5" /> Live data</span></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total users" value={stats.totalUsers.toLocaleString()} detail={`${stats.newUsers.toLocaleString()} new in 30 days`} icon={Users} />
      <StatCard label="Transactions" value={stats.totalTransactions.toLocaleString()} detail={`${currency.format(stats.income)} income tracked`} icon={ReceiptText} accent="sky" />
      <StatCard label="Goals" value={stats.totalGoals.toLocaleString()} detail={`${stats.activeGoals} active · ${stats.completedGoals} completed`} icon={Goal} accent="amber" />
      <StatCard label="Contributions" value={stats.totalContributions.toLocaleString()} detail={`${currency.format(stats.contributionAmount)} recorded`} icon={CircleDollarSign} />
      <StatCard label="Investments" value={stats.totalInvestments.toLocaleString()} detail="Investment records" icon={TrendingUp} accent="violet" />
      <StatCard label="Expenses" value={currency.format(stats.expenses)} detail="Across all tracked transactions" icon={CircleDollarSign} accent="amber" />
      <StatCard label="Assistant queries" value={stats.assistantQueries.toLocaleString()} detail="Persisted usage events" icon={Bot} accent="sky" />
      <StatCard label="Historical records" value={stats.historicalContributions.toLocaleString()} detail="Contribution records marked historical" icon={Activity} accent="violet" />
    </section>
    <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-[#1E3347] bg-[#0D1D2E] p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#7894AA]">Financial flow</p><h2 className="mt-1 text-xl font-semibold">Income versus expenses</h2></div><ArrowUpRight className="h-5 w-5 text-[#10B981]" /></div><div className="mt-8 grid grid-cols-2 gap-4"><div className="rounded-xl bg-[#102437] p-4"><p className="text-xs text-[#7894AA]">Income</p><p className="mt-2 text-xl font-semibold text-[#6EE7B7]">{currency.format(stats.income)}</p></div><div className="rounded-xl bg-[#102437] p-4"><p className="text-xs text-[#7894AA]">Expenses</p><p className="mt-2 text-xl font-semibold text-rose-300">{currency.format(stats.expenses)}</p></div></div></div><div className="rounded-2xl border border-[#1E3347] bg-[#0D1D2E] p-6"><p className="text-sm text-[#7894AA]">Data coverage</p><h2 className="mt-1 text-xl font-semibold">Operational notes</h2><div className="mt-5 space-y-3">{Object.entries(availability).map(([key, value]) => <div key={key} className="rounded-xl border border-[#1E3347] bg-[#102437] p-3"><p className="text-xs font-semibold uppercase tracking-wider text-[#6EE7B7]">{key.replace(/([A-Z])/g, " $1")}</p><p className="mt-1 text-sm leading-6 text-[#9BB1C2]">{value}</p></div>)}</div></div></section>
  </div>;
}
