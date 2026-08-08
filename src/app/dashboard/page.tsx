"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, BadgeCheck, Briefcase, CreditCard, Landmark, Sparkles, Target, TrendingUp } from "lucide-react"
import Navbar from "../../../components/Navbar"
import Footer from "../../../components/Footer"
import { useSession } from "@/hooks/useSession"

interface TransactionRecord {
  _id: string
  type: "Income" | "Expense"
  amount: number
  category: string
  description: string
  paymentMethod: string
  date: string
  createdAt: string
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export default function DashboardPage() {
  const { status, session } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(false)

  const user = session?.user
  const displayName = user?.name || user?.email || "Investor"

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }

    if (status !== "authenticated") {
      return
    }

    let isCancelled = false

    const loadTransactions = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/transactions")
        const payload = await response.json()

        if (!isCancelled && payload.success) {
          setTransactions(payload.transactions || [])
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    const timer = window.setTimeout(() => {
      void loadTransactions()
    }, 0)

    return () => {
      isCancelled = true
      window.clearTimeout(timer)
    }
  }, [router, status])

  const stats = useMemo(() => {
    const income = transactions.reduce(
      (sum, item) => sum + (item.type === "Income" ? item.amount : 0),
      0
    );

    const expense = transactions.reduce(
      (sum, item) => sum + (item.type === "Expense" ? item.amount : 0),
      0
    );

    const balance = income - expense;
    const savings = Math.max(balance, 0);

    const savingsRate =
      income > 0 ? Math.round((balance / income) * 100) : 0;

    const expenseRatio =
      income > 0 ? Math.round((expense / income) * 100) : 0;

    const savingsScore = Math.max(
      0,
      Math.min(savingsRate * 2, 100)
    );

    const expenseScore = Math.max(
      0,
      Math.min(100 - expenseRatio, 100)
    );

    const healthScore =
      income > 0
        ? Math.round(savingsScore * 0.6 + expenseScore * 0.4)
        : 0;

    const healthLabel =
      healthScore >= 90
        ? "Excellent"
        : healthScore >= 75
          ? "Good"
          : healthScore >= 60
            ? "Average"
            : "Needs work";

    const healthMessage =
      healthScore >= 90
        ? "Your savings and spending habits are very strong."
        : healthScore >= 75
          ? "You are building a healthy financial foundation."
          : healthScore >= 60
            ? "Your finances are stable, but there is room to improve."
            : "Reduce expenses and increase your monthly savings.";

    const recentTransactions = [...transactions]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);

    return {
      income,
      expense,
      balance,
      savings,
      savingsRate,
      expenseRatio,
      healthScore,
      healthLabel,
      healthMessage,
      recentTransactions,
    };
  }, [transactions]);

  const kpis = [
    { label: "Net Worth", value: formatCurrency(stats.balance), hint: stats.balance >= 0 ? "Positive balance from your activity" : "Spending is above income" },
    { label: "Income", value: formatCurrency(stats.income), hint: "Total income recorded" },
    { label: "Expense", value: formatCurrency(stats.expense), hint: "Total expense recorded" },
    { label: "Savings Rate", value: `${stats.savingsRate}%`, hint: stats.savingsRate >= 0 ? "Healthy monthly pace" : "Adjust spending to improve savings" },
  ]

  const summaryRows = [
    { label: "Income", value: formatCurrency(stats.income), tone: "text-[#10B981]" },
    { label: "Expense", value: formatCurrency(stats.expense), tone: "text-rose-400" },
    { label: "Balance", value: formatCurrency(stats.balance), tone: stats.balance >= 0 ? "text-[#10B981]" : "text-amber-400" },
    { label: "Savings", value: formatCurrency(stats.savings), tone: "text-[#10B981]" },
  ]

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)] text-white">
          <p className="text-[#94A3B8]">Loading your dashboard...</p>
        </main>
      </>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[32px] border border-[#334155] bg-[#0F172A]/90 p-5 shadow-[0_0_50px_rgba(16,185,129,0.12)] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-3 py-1 text-sm font-semibold text-[#D4F2D3]">
                    <Sparkles className="h-4 w-4 text-[#10B981]" />
                    Welcome back
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Welcome, {displayName}</h1>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[#94A3B8] sm:text-base">
                    Your financial snapshot is based on your latest transactions and updates automatically as you add new entries.
                  </p>
                </div>
                <div className="w-full rounded-3xl border border-[#10B981]/30 bg-[#10B981]/10 px-5 py-4 text-left sm:w-auto sm:text-right">
                  <p className="text-sm text-[#D4F2D3]">Current Balance</p>
                  <div className="mt-1 flex items-end justify-start gap-2 sm:justify-end">
                    <span className="text-4xl font-semibold text-white">{formatCurrency(stats.balance)}</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-1 text-sm font-semibold text-[#10B981]">
                    <BadgeCheck className="h-4 w-4" />
                    {stats.balance >= 0 ? "Positive" : "Needs attention"}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-[#1F2937] bg-[#111827]/80 p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[#94A3B8]">Net Worth</p>
                    <p className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{formatCurrency(stats.balance)}</p>
                  </div>
                  <div className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-sm font-semibold text-[#10B981]">
                    {stats.balance >= 0 ? "Healthy cash flow" : "Spending above income"}
                  </div>
                </div>
              </div>
            </section>

            <aside className="rounded-[32px] border border-[#334155] bg-[#0F172A]/90 p-5 shadow-[0_0_40px_rgba(16,185,129,0.08)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 p-3 text-[#10B981]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Quick insight</h2>
                  <p className="text-sm text-[#94A3B8]">Your latest transactions show a {stats.balance >= 0 ? "positive" : "negative"} balance trend.</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#E2E8F0]">
                    <Target className="h-4 w-4 text-[#10B981]" />
                    Savings
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(stats.savings)}</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">Amount left after expenses.</p>
                </div>
                <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#E2E8F0]">
                    <Briefcase className="h-4 w-4 text-[#10B981]" />
                    Expense Ratio
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">{stats.income > 0 ? `${Math.round((stats.expense / stats.income) * 100)}%` : "0%"}</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">Based on your recorded spending.</p>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-5 shadow-[0_0_25px_rgba(16,185,129,0.08)]">
                <p className="text-sm text-[#94A3B8]">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 text-sm text-[#10B981]">{item.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#94A3B8]">
                <CreditCard className="h-4 w-4 text-[#10B981]" />
                Monthly Flow
              </div>
              <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2">
                {summaryRows.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4">
                    <p className="text-sm text-[#94A3B8]">{item.label}</p>
                    <p className={`mt-2 text-xl font-semibold ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#94A3B8]">
                  <Landmark className="h-4 w-4 text-[#10B981]" />
                  Financial Health
                </div>

                <div className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
                  {stats.healthLabel}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#94A3B8]">
                      Overall score
                    </p>

                    <p className="mt-1 text-4xl font-semibold text-white">
                      {stats.healthScore}
                      <span className="text-lg text-[#64748B]"> / 100</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-[#64748B]">
                      Score band
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#10B981]">
                      {stats.healthScore >= 90
                        ? "Excellent"
                        : stats.healthScore >= 75
                          ? "Good"
                          : stats.healthScore >= 60
                            ? "Average"
                            : "Needs work"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#1F2937]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] via-[#10B981] to-[#34D399] transition-all duration-500"
                    style={{ width: `${stats.healthScore}%` }}
                    role="progressbar"
                    aria-valuenow={stats.healthScore}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Financial health score"
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-3">
                    <p className="text-xs text-[#64748B]">Savings rate</p>
                    <p className="mt-1 text-lg font-semibold text-[#10B981]">
                      {stats.savingsRate}%
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-3">
                    <p className="text-xs text-[#64748B]">Expense ratio</p>
                    <p className="mt-1 text-lg font-semibold text-rose-400">
                      {stats.expenseRatio}%
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#94A3B8]">
                  {stats.healthMessage}
                </p>
              </div>
            </div>
          </div>

          <section className="mt-6 rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                <p className="mt-1 text-sm text-[#94A3B8]">Your latest 5 entries</p>
              </div>
              <Link href="/transactions" className="inline-flex items-center gap-2 text-sm font-semibold text-[#10B981] hover:text-[#34d399]">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 px-4 py-4 text-sm text-[#94A3B8]">
                  Loading transactions...
                </div>
              ) : stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((item) => (
                  <div key={item._id} className="flex flex-col gap-3 rounded-2xl border border-[#1F2937] bg-[#111827]/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.description || item.category}</p>
                      <p className="mt-1 text-sm text-[#94A3B8]">{new Date(item.date).toLocaleDateString()} • {item.category} • {item.type}</p>
                    </div>
                    <div className={`text-sm font-semibold ${item.type === "Income" ? "text-[#10B981]" : "text-rose-400"}`}>
                      {item.type === "Income" ? "+" : "-"}{formatCurrency(item.amount)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 px-4 py-4 text-sm text-[#94A3B8]">
                  No transactions yet. Add your first transaction to see the dashboard update.
                </div>
              )}
            </div>
          </section>
        </div>

        <Footer />
      </main>
    </>
  )
}
