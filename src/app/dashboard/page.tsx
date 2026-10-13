"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Plus, RefreshCw, Sparkles } from "lucide-react"
import Navbar from "../../../components/Navbar"
import AppFooter from "../../components/AppFooter"
import { useSession } from "@/hooks/useSession"
import { refreshAllInvestments } from "@/lib/api/investments"

interface TransactionRecord {
  _id: string
  type: "Income" | "Expense"
  amount: number
  category: string
  description: string
  date: string
}

interface BudgetRecord {
  _id: string
  category: string
  limit: number
  spent: number
}

interface GoalRecord {
  _id: string
  name: string
  targetAmount: number
  currentAmount: number
  completed: boolean
}

interface InvestmentRecord {
  _id: string
  currentValue: number
  totalInvested: number
  profitLoss: number
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
  const [budgets, setBudgets] = useState<BudgetRecord[]>([])
  const [goals, setGoals] = useState<GoalRecord[]>([])
  const [investments, setInvestments] = useState<InvestmentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState("")

  const loadDashboardData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const responses = await Promise.all([
        fetch("/api/transactions", { credentials: "include", cache: "no-store", signal }),
        fetch("/api/budgets", { credentials: "include", cache: "no-store", signal }),
        fetch("/api/goals", { credentials: "include", cache: "no-store", signal }),
        fetch("/api/investments", { credentials: "include", cache: "no-store", signal }),
      ])
      const payloads = await Promise.all(responses.map((response) => response.json()))

      if (payloads[0].success) setTransactions(payloads[0].transactions || [])
      if (payloads[1].success) setBudgets(payloads[1].budgets || [])
      if (payloads[2].success) setGoals(payloads[2].goals || [])
      if (payloads[3].success) setInvestments(payloads[3].investments || [])
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Dashboard loading error:", error)
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }
    if (status !== "authenticated") return

    const timer = window.setTimeout(() => void loadDashboardData(), 0)
    return () => window.clearTimeout(timer)
  }, [status, router, loadDashboardData])

  const stats = useMemo(() => {
    const income = transactions.reduce((sum, item) => sum + (item.type === "Income" ? item.amount : 0), 0)
    const expense = transactions.reduce((sum, item) => sum + (item.type === "Expense" ? item.amount : 0), 0)
    const balance = income - expense
    const savings = Math.max(balance, 0)
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0
    const expenseRatio = income > 0 ? Math.round((expense / income) * 100) : 0
    const healthScore = income > 0
      ? Math.round(Math.max(savingsRate * 2, 0) * 0.6 + Math.max(100 - expenseRatio, 0) * 0.4)
      : 0
    const healthLabel = healthScore >= 90 ? "Excellent" : healthScore >= 75 ? "Good" : healthScore >= 60 ? "Average" : "Needs work"
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)

    return { income, expense, balance, savings, savingsRate, healthScore, healthLabel, recentTransactions }
  }, [transactions])

  const investmentTotals = useMemo(
    () => investments.reduce(
      (totals, investment) => ({
        invested: totals.invested + investment.totalInvested,
        current: totals.current + investment.currentValue,
        profitLoss: totals.profitLoss + investment.profitLoss,
      }),
      { invested: 0, current: 0, profitLoss: 0 },
    ),
    [investments],
  )

  const totalNetWorth = stats.balance + investmentTotals.current
  const allocatedGoalAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const availableCash = Math.max(totalNetWorth - allocatedGoalAmount, 0)
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0)
  const totalBudgetSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const budgetUsage = totalBudget > 0 ? Math.min(Math.round((totalBudgetSpent / totalBudget) * 100), 100) : 0
  const activeGoals = goals.filter((goal) => !goal.completed)
  const goalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, goal) => sum + (goal.targetAmount > 0 ? Math.min(goal.currentAmount / goal.targetAmount * 100, 100) : 0), 0) / activeGoals.length)
    : 0

  async function handleRefreshPrices() {
    try {
      setRefreshing(true)
      setRefreshMessage("")
      const result = await refreshAllInvestments()
      setRefreshMessage(result.failedCount > 0
        ? `Updated ${result.updatedCount}; ${result.failedCount} failed.`
        : `Updated ${result.updatedCount} investment(s).`)
      await loadDashboardData()
    } catch (error) {
      setRefreshMessage(error instanceof Error ? error.message : "Unable to refresh investment prices")
    } finally {
      setRefreshing(false)
    }
  }

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-[#020617] text-[#94A3B8]">Loading your dashboard...</main>
      </>
    )
  }

  const displayName = session?.user?.name || session?.user?.email || "Investor"
  const insight = budgets.length > 0 && budgetUsage >= 80
    ? {
      title: budgetUsage >= 100 ? "Budget limit reached" : "Budget needs attention",
      text: `${budgetUsage}% of your budget is used. Review your spending before the month ends.`,
      href: "/budgets",
      action: "Review budgets",
    }
    : stats.income > 0 && stats.savingsRate > 0
      ? {
        title: "Savings are moving in the right direction",
        text: `You have saved ${formatCurrency(stats.savings)} from recorded income this month.`,
        href: "/analysis",
        action: "View analysis",
      }
      : {
        title: "Build your financial picture",
        text: "Add transactions, budgets, or goals to unlock personalized financial insights.",
        href: "/transactions",
        action: "Add a transaction",
      }

  const kpis = [
    ["Total net worth", formatCurrency(totalNetWorth), "Cash plus investments"],
    ["Available cash", formatCurrency(availableCash), "After goal allocations"],
    ["Monthly income", formatCurrency(stats.income), "Recorded income"],
    ["Monthly expenses", formatCurrency(stats.expense), "Recorded spending"],
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden bg-[#020617] text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="flex flex-col gap-4 border-b border-[#1E293B] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#10B981]">Financial overview</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, {displayName}</h1>
              <p className="mt-1 text-sm text-[#94A3B8]">Here is what needs your attention today.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/transactions" className="inline-flex items-center gap-2 rounded-lg border border-[#334155] bg-[#111827] px-3 py-2 text-sm font-semibold transition hover:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]">
                <Plus className="h-4 w-4 text-[#10B981]" /> Add transaction
              </Link>
              <Link href="/investments" className="inline-flex items-center gap-2 rounded-lg bg-[#10B981] px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#34D399] focus:outline-none focus:ring-2 focus:ring-[#6EE7B7]">
                <Plus className="h-4 w-4" /> Add investment
              </Link>
              {investments.length > 0 && (
                <button type="button" onClick={handleRefreshPrices} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-[#334155] px-3 py-2 text-sm font-semibold text-[#CBD5E1] transition hover:border-[#10B981] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#10B981]">
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> {refreshing ? "Refreshing" : "Refresh prices"}
                </button>
              )}
            </div>
          </header>
          {refreshMessage && <p className="mt-3 text-right text-xs text-[#94A3B8]" role="status">{refreshMessage}</p>}

          <section aria-labelledby="summary-heading" className="mt-6">
            <h2 id="summary-heading" className="sr-only">Financial summary</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {kpis.map(([label, value, hint]) => (
                <div key={label} className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4">
                  <p className="text-sm text-[#94A3B8]">{label}</p>
                  <p className="mt-2 truncate text-2xl font-semibold">{value}</p>
                  <p className="mt-1 text-xs text-[#64748B]">{hint}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="health-heading" className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="health-heading" className="text-lg font-semibold">Financial health</h2>
              <span className="text-xs text-[#64748B]">{stats.healthLabel} · {stats.healthScore}/100</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <HealthCard label="Budget health" value={budgets.length ? `${budgetUsage}% used` : "No budgets yet"} status={budgets.length ? (budgetUsage >= 80 ? "Needs attention" : "On track") : "Get started"} progress={budgets.length ? budgetUsage : 0} href="/budgets" link="View budgets" warning={budgetUsage >= 80} />
              <HealthCard label="Savings rate" value={stats.income > 0 ? `${stats.savingsRate}%` : "Not available"} status={stats.income > 0 ? (stats.savingsRate > 0 ? "Saving this month" : "Review spending") : "Add income"} progress={stats.income > 0 ? Math.min(Math.max(stats.savingsRate, 0), 100) : 0} href="/analysis" link="View analysis" warning={stats.income > 0 && stats.savingsRate <= 0} />
              <HealthCard label="Goal progress" value={activeGoals.length ? `${goalProgress}% average` : "No active goals"} status={activeGoals.length ? `${activeGoals.length} active goal${activeGoals.length === 1 ? "" : "s"}` : "Get started"} progress={goalProgress} href="/goals" link="View goals" warning={false} />
            </div>
          </section>

          <section aria-labelledby="insight-heading" className="mt-6 flex flex-col gap-4 rounded-xl border border-[#10B981]/25 bg-[#0B1F1A] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#10B981]/15 p-2 text-[#34D399]"><Sparkles className="h-4 w-4" /></div>
              <div><h2 id="insight-heading" className="font-semibold">{insight.title}</h2><p className="mt-1 text-sm text-[#A7C7BB]">{insight.text}</p></div>
            </div>
            <Link href={insight.href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#34D399] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]">{insight.action}<ArrowRight className="h-4 w-4" /></Link>
          </section>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <section aria-labelledby="activity-heading" className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4">
              <div className="flex items-center justify-between gap-3">
                <div><h2 id="activity-heading" className="font-semibold">Recent activity</h2><p className="mt-1 text-xs text-[#64748B]">Your three latest transactions</p></div>
                <Link href="/transactions" className="inline-flex items-center gap-1 text-sm font-semibold text-[#10B981] hover:text-[#34D399] focus:outline-none focus:ring-2 focus:ring-[#10B981]">View all<ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="mt-4 divide-y divide-[#1E293B]">
                {loading ? <p className="py-4 text-sm text-[#94A3B8]">Loading transactions...</p> : stats.recentTransactions.length > 0 ? stats.recentTransactions.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0"><p className="truncate text-sm font-medium">{item.description || item.category}</p><p className="mt-1 text-xs text-[#64748B]">{item.category} · {new Date(item.date).toLocaleDateString("en-IN")}</p></div>
                    <p className={`shrink-0 text-sm font-semibold ${item.type === "Income" ? "text-[#34D399]" : "text-rose-400"}`}>{item.type === "Income" ? "+" : "-"}{formatCurrency(item.amount)}</p>
                  </div>
                )) : <div className="py-4"><p className="text-sm text-[#94A3B8]">No transactions yet.</p><Link href="/transactions" className="mt-2 inline-flex text-sm font-semibold text-[#10B981] hover:text-[#34D399]">Add your first transaction</Link></div>}
              </div>
            </section>

            <section aria-labelledby="portfolio-heading" className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4">
              <div className="flex items-center justify-between gap-3"><div><h2 id="portfolio-heading" className="font-semibold">Portfolio snapshot</h2><p className="mt-1 text-xs text-[#64748B]">{investments.length} tracked asset{investments.length === 1 ? "" : "s"}</p></div><Link href="/investments" className="text-sm font-semibold text-[#10B981] hover:text-[#34D399] focus:outline-none focus:ring-2 focus:ring-[#10B981]">View portfolio</Link></div>
              {investments.length > 0 ? <div className="mt-5"><p className="text-xs text-[#64748B]">Current value</p><p className="mt-1 text-2xl font-semibold">{formatCurrency(investmentTotals.current)}</p><div className="mt-4 flex items-center justify-between border-t border-[#1E293B] pt-3 text-sm"><span className="text-[#94A3B8]">Profit / loss</span><span className={investmentTotals.profitLoss >= 0 ? "font-semibold text-[#34D399]" : "font-semibold text-rose-400"}>{investmentTotals.profitLoss >= 0 ? "+" : ""}{formatCurrency(investmentTotals.profitLoss)}</span></div></div> : <div className="mt-5"><p className="text-sm text-[#94A3B8]">No investments added yet.</p><Link href="/investments" className="mt-2 inline-flex text-sm font-semibold text-[#10B981] hover:text-[#34D399]">Add your first investment</Link></div>}
            </section>
          </div>
        </div>
        <AppFooter />
      </main>
    </>
  )
}

function HealthCard({ label, value, status, progress, href, link, warning }: { label: string; value: string; status: string; progress: number; href: string; link: string; warning: boolean }) {
  const safeProgress = Math.min(Math.max(progress, 0), 100)
  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4">
      <div className="flex items-start justify-between gap-3"><div><p className="text-sm text-[#94A3B8]">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${warning ? "bg-amber-400/10 text-amber-300" : "bg-[#10B981]/10 text-[#34D399]"}`}>{status}</span></div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#1E293B]" role="progressbar" aria-label={`${label} progress`} aria-valuenow={safeProgress} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full ${warning ? "bg-amber-400" : "bg-[#10B981]"}`} style={{ width: `${safeProgress}%` }} /></div>
      <Link href={href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#10B981] hover:text-[#34D399] focus:outline-none focus:ring-2 focus:ring-[#10B981]">{link}<ArrowRight className="h-3.5 w-3.5" /></Link>
    </div>
  )
}
