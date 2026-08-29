"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, BadgeCheck, Briefcase, CreditCard, Landmark, Sparkles, Target, TrendingUp } from "lucide-react"
import Navbar from "../../../components/Navbar"
import AppFooter from "../../components/AppFooter";
import { useSession } from "@/hooks/useSession";
import { refreshAllInvestments } from "@/lib/api/investments";


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

interface BudgetRecord {
  _id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

interface GoalRecord {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  completed: boolean;
}

interface InvestmentRecord {
  _id: string;
  name: string;
  type: string;
  symbol?: string;
  schemeCode?: string;
  goldPurity?: "18K" | "22K" | "24K";
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  totalInvested: number;
  profitLoss: number;
  returnPercentage: number;
  purchaseDate?: string;
  createdAt?: string;
  priceSource?: "MANUAL" | "MARKET_API";
  priceUpdatedAt?: string;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatInvestmentDate(
  investment: InvestmentRecord
) {
  const date =
    investment.createdAt || investment.purchaseDate;

  if (!date) {
    return "Date unavailable";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return `Added ${parsedDate.toLocaleDateString()}`;
}

export default function DashboardPage() {
  const { status, session } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [investments, setInvestments] = useState<
    InvestmentRecord[]
  >([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] =
    useState("");

  const user = session?.user
  const displayName = user?.name || user?.email || "Investor"

  const loadDashboardData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);

      try {
        const [
          transactionsResponse,
          budgetsResponse,
          goalsResponse,
          investmentsResponse,
        ] = await Promise.all([
          fetch("/api/transactions", {
            credentials: "include",
            cache: "no-store",
            signal,
          }),
          fetch("/api/budgets", {
            credentials: "include",
            cache: "no-store",
            signal,
          }),
          fetch("/api/goals", {
            credentials: "include",
            cache: "no-store",
            signal,
          }),
          fetch("/api/investments", {
            credentials: "include",
            cache: "no-store",
            signal,
          }),
        ]);

        const [
          transactionsPayload,
          budgetsPayload,
          goalsPayload,
          investmentsPayload,
        ] = await Promise.all([
          transactionsResponse.json(),
          budgetsResponse.json(),
          goalsResponse.json(),
          investmentsResponse.json(),
        ]);

        if (transactionsPayload.success) {
          setTransactions(
            transactionsPayload.transactions || []
          );
        }

        if (budgetsPayload.success) {
          setBudgets(budgetsPayload.budgets || []);
        }

        if (goalsPayload.success) {
          setGoals(goalsPayload.goals || []);
        }

        if (investmentsPayload.success) {
          setInvestments(
            investmentsPayload.investments || []
          );
        }
      } catch (error) {
        if (error instanceof DOMException &&
          error.name === "AbortError") {
          return;
        }

        console.error("Dashboard loading error:", error);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [status, router, loadDashboardData]);

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

  const investmentTotals = useMemo(() => {
    return investments.reduce(
      (totals, investment) => ({
        invested:
          totals.invested + investment.totalInvested,
        current:
          totals.current + investment.currentValue,
        profitLoss:
          totals.profitLoss + investment.profitLoss,
      }),
      {
        invested: 0,
        current: 0,
        profitLoss: 0,
      }
    );
  }, [investments]);

  const portfolioReturnPercentage =
    investmentTotals.invested > 0
      ? (investmentTotals.profitLoss /
        investmentTotals.invested) *
      100
      : 0;

  const investmentTypeCounts = investments.reduce<
    Record<string, number>
  >((counts, investment) => {
    counts[investment.type] =
      (counts[investment.type] || 0) + 1;

    return counts;
  }, {});

  const topInvestmentTypes = Object.entries(
    investmentTypeCounts
  ).sort(([, countA], [, countB]) => countB - countA);

  const kpis = [
    {
      label: "Cash Balance",
      value: formatCurrency(stats.balance),
      hint:
        stats.balance >= 0
          ? "Positive balance from your activity"
          : "Spending is above income",
    },
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

  const totalBudget = budgets.reduce(
    (sum, budget) => sum + budget.limit,
    0
  );

  const totalBudgetSpent = budgets.reduce(
    (sum, budget) => sum + budget.spent,
    0
  );

  const budgetUsage =
    totalBudget > 0
      ? Math.min(
        Math.round((totalBudgetSpent / totalBudget) * 100),
        100
      )
      : 0;

  const activeGoals = goals.filter((goal) => !goal.completed);

  const closestGoal = activeGoals
    .map((goal) => ({
      ...goal,
      progress:
        goal.targetAmount > 0
          ? Math.min(
            Math.round(
              (goal.currentAmount / goal.targetAmount) * 100
            ),
            100
          )
          : 0,
    }))
    .sort((a, b) => b.progress - a.progress)[0];

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

  const latestInvestments = [...investments]
    .sort((a, b) => {
      const dateA = a.createdAt || a.purchaseDate;
      const dateB = b.createdAt || b.purchaseDate;

      const timeA = dateA
        ? new Date(dateA).getTime()
        : 0;

      const timeB = dateB
        ? new Date(dateB).getTime()
        : 0;

      return timeB - timeA;
    })
    .slice(0, 3);

  async function handleRefreshPrices() {
    try {
      setRefreshing(true);
      setRefreshMessage("");

      const result = await refreshAllInvestments();

      setRefreshMessage(
        result.failedCount > 0
          ? `Updated ${result.updatedCount} investment(s). ${result.failedCount} failed.`
          : `Updated ${result.updatedCount} investment(s).`
      );

      await loadDashboardData();
    } catch (error) {
      setRefreshMessage(
        error instanceof Error
          ? error.message
          : "Unable to refresh investment prices"
      );
    } finally {
      setRefreshing(false);
    }
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
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-3 py-1 text-sm font-semibold text-[#D4F2D3]">
                      <Sparkles className="h-4 w-4 text-[#10B981]" />
                      Welcome back
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleRefreshPrices}
                        disabled={refreshing}
                        className="rounded-xl bg-[#10B981] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#34D399] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {refreshing
                          ? "Refreshing prices..."
                          : "Refresh prices"}
                      </button>

                      {refreshMessage && (
                        <p className="text-sm text-[#94A3B8]">
                          {refreshMessage}
                        </p>
                      )}
                    </div>
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

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Budget Progress
                  </h2>
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    Current spending across your budgets
                  </p>
                </div>

                <Link
                  href="/budgets"
                  className="text-sm font-semibold text-[#10B981] hover:text-[#34D399]"
                >
                  View budgets
                </Link>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">
                    {formatCurrency(totalBudgetSpent)} spent
                  </span>

                  <span className="text-[#CBD5E1]">
                    {formatCurrency(totalBudget)} limit
                  </span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#1F2937]">
                  <div
                    className={`h-full rounded-full transition-all ${budgetUsage >= 100
                      ? "bg-rose-500"
                      : budgetUsage >= 80
                        ? "bg-amber-400"
                        : "bg-[#10B981]"
                      }`}
                    style={{ width: `${budgetUsage}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#10B981]">
                    {budgetUsage}% used
                  </span>

                  <span className="text-sm text-[#94A3B8]">
                    {budgets.length} budget{budgets.length === 1 ? "" : "s"}
                  </span>
                </div>

                {budgets.length === 0 && (
                  <p className="mt-4 text-sm text-[#94A3B8]">
                    Create a budget to start tracking your spending.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Goal Progress
                  </h2>
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    Your closest active financial goal
                  </p>
                </div>

                <Link
                  href="/goals"
                  className="text-sm font-semibold text-[#10B981] hover:text-[#34D399]"
                >
                  View goals
                </Link>
              </div>

              {closestGoal ? (
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {closestGoal.name}
                      </p>

                      <p className="mt-1 text-sm text-[#94A3B8]">
                        {formatCurrency(closestGoal.currentAmount)} of{" "}
                        {formatCurrency(closestGoal.targetAmount)}
                      </p>
                    </div>

                    <span className="text-lg font-semibold text-[#10B981]">
                      {closestGoal.progress}%
                    </span>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#1F2937]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all"
                      style={{ width: `${closestGoal.progress}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-[#94A3B8]">
                    {formatCurrency(
                      Math.max(
                        closestGoal.targetAmount -
                        closestGoal.currentAmount,
                        0
                      )
                    )}{" "}
                    remaining
                  </p>
                </div>
              ) : (
                <p className="mt-5 text-sm text-[#94A3B8]">
                  Create a goal to start tracking your progress.
                </p>
              )}

              {goals.some((goal) => goal.completed) && (
                <div className="mt-4 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 text-sm text-[#D4F2D3]">
                  🎉 You have completed at least one goal.
                </div>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-6 shadow-[0_0_30px_rgba(16,185,129,0.06)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    Investments
                  </h2>

                  <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    {investments.length}{" "}
                    {investments.length === 1
                      ? "asset"
                      : "assets"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#94A3B8]">
                  Your portfolio performance at a glance
                </p>
              </div>

              <Link
                href="/investments"
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#10B981] hover:text-[#34D399]"
              >
                Manage portfolio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {investments.length > 0 ? (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4">
                    <p className="text-sm text-[#94A3B8]">
                      Total invested
                    </p>

                    <p className="mt-2 text-xl font-semibold text-white">
                      {formatCurrency(investmentTotals.invested)}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Across {investments.length}{" "}
                      {investments.length === 1 ? "asset" : "assets"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4">
                    <p className="text-sm text-[#94A3B8]">
                      Current value
                    </p>

                    <p className="mt-2 text-xl font-semibold text-white">
                      {formatCurrency(investmentTotals.current)}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Latest recorded valuation
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4">
                    <p className="text-sm text-[#94A3B8]">
                      Total profit/loss
                    </p>

                    <p
                      className={`mt-2 text-xl font-semibold ${investmentTotals.profitLoss >= 0
                        ? "text-[#10B981]"
                        : "text-rose-400"
                        }`}
                    >
                      {investmentTotals.profitLoss >= 0
                        ? "+"
                        : ""}
                      {formatCurrency(
                        investmentTotals.profitLoss
                      )}
                    </p>

                    <p
                      className={`mt-1 text-xs ${portfolioReturnPercentage >= 0
                        ? "text-[#10B981]"
                        : "text-rose-400"
                        }`}
                    >
                      {portfolioReturnPercentage >= 0
                        ? "+"
                        : ""}
                      {portfolioReturnPercentage.toFixed(2)}%
                      overall return
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4">
                    <p className="text-sm text-[#94A3B8]">
                      Asset mix
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {topInvestmentTypes.map(([type, count]) => (
                        <span
                          key={type}
                          className="rounded-full border border-[#334155] bg-[#0F172A] px-2 py-1 text-xs text-[#CBD5E1]"
                        >
                          {type}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Portfolio status
                    </p>

                    <p className="mt-1 text-sm text-[#94A3B8]">
                      {investmentTotals.profitLoss >= 0
                        ? "Your portfolio is currently above its invested value."
                        : "Your portfolio is currently below its invested value."}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${investmentTotals.profitLoss >= 0
                      ? "bg-[#10B981]/10 text-[#10B981]"
                      : "bg-rose-500/10 text-rose-400"
                      }`}
                  >
                    {investmentTotals.profitLoss >= 0
                      ? "Positive return"
                      : "Negative return"}
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-[#334155] bg-[#111827]/50 p-6 text-center">
                <p className="font-semibold text-white">
                  Your portfolio is empty
                </p>

                <p className="mt-2 text-sm text-[#94A3B8]">
                  Add your first investment to start tracking value and returns.
                </p>

                <Link
                  href="/investments/new"
                  className="mt-4 inline-flex rounded-xl bg-[#10B981] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#34D399]"
                >
                  Add investment
                </Link>
              </div>
            )}
          </section>

          <section className="mt-6 rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Latest Investments
                </h2>

                <p className="mt-1 text-sm text-[#94A3B8]">
                  Your three most recently added investments
                </p>
              </div>

              <Link
                href="/investments"
                className="text-sm font-semibold text-[#10B981] hover:text-[#34D399]"
              >
                View all
              </Link>
            </div>

            {latestInvestments.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {latestInvestments.map((investment) => (
                  <div
                    key={investment._id}
                    className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-white">
                          {investment.name}
                        </h3>

                        <p className="mt-1 text-xs text-[#94A3B8]">
                          {investment.symbol ||
                            investment.schemeCode ||
                            investment.goldPurity ||
                            "Manual investment"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2 py-1 text-xs font-medium text-[#10B981]">
                        {investment.type}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-[#64748B]">
                        Current value
                      </p>

                      <p className="mt-1 text-xl font-semibold text-white">
                        {formatCurrency(investment.currentValue)}
                      </p>

                      <p
                        className={`mt-1 text-sm font-semibold ${investment.profitLoss >= 0
                          ? "text-[#10B981]"
                          : "text-rose-400"
                          }`}
                      >
                        {investment.profitLoss >= 0 ? "+" : ""}
                        {formatCurrency(investment.profitLoss)}
                      </p>

                      <p className="mt-1 text-xs text-[#94A3B8]">
                        Invested: {formatCurrency(investment.totalInvested)}
                      </p>

                    </div>

                    <div className="mt-3 border-t border-[#1F2937] pt-3">
                      <p className="mt-1 text-xs text-[#64748B]">
                        {formatInvestmentDate(investment)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4">
                <p className="text-sm text-[#94A3B8]">
                  No investments added yet.
                </p>

                <Link
                  href="/investments/new"
                  className="mt-3 inline-flex text-sm font-semibold text-[#10B981] hover:text-[#34D399]"
                >
                  Add your first investment
                </Link>
              </div>
            )}
          </section>

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

        <AppFooter />
      </main>
    </>
  )
}
