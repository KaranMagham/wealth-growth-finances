"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Plus, Target, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import AppFooter from "../../components/AppFooter";
import { useSession } from "@/hooks/useSession";
import { EXPENSE_CATEGORIES } from "@/constants/transaction";

interface BudgetItem {
  _id: string;
  category: string;
  limit: number;
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  spent?: number;
  remaining?: number;
  percentageUsed?: number;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) =>
  currencyFormatter.format(value);

const initialForm = {
  category: "",
  limit: ""
};

export default function BudgetsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const loadBudgets = async () => {
      try {
        const response = await fetch("/api/budgets");
        const data = await response.json();

        if (data.success) {
          setBudgets(data.budgets || []);
        } else {
          setMessage(data.message || "Unable to load budgets");
        }
      } catch (error) {
        console.error(error);
        setMessage("Unable to load budgets");
      } finally {
        setLoading(false);
      }
    };

    void loadBudgets();
  }, [status]);

  const totals = useMemo(() => {
    const totalLimit = budgets.reduce(
      (sum, budget) => sum + budget.limit,
      0
    );

    const totalSpent = budgets.reduce(
      (sum, budget) => sum + (budget.spent || 0),
      0
    );

    const totalRemaining = totalLimit - totalSpent;

    const percentageUsed =
      totalLimit > 0
        ? Math.round((totalSpent / totalLimit) * 100)
        : 0;

    return {
      totalLimit,
      totalSpent,
      totalRemaining,
      percentageUsed,
    };
  }, [budgets]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!form.category || Number(form.limit) <= 0) {
      setMessage("Select a category and enter a valid limit");
      return;
    }

    setSaving(true);

    try {
      const now = new Date();

      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: form.category,
          limit: Number(form.limit),
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Unable to create budget");
        return;
      }

      setBudgets((current) => [data.budget, ...current]);
      setForm(initialForm);
      setMessage("Budget created successfully");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this budget?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Unable to delete budget");
        return;
      }

      setBudgets((current) =>
        current.filter((budget) => budget._id !== id)
      );
      setMessage("Budget deleted");
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete budget");
    }
  };

  if (status === "loading" || loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
          <p className="text-[#94A3B8]">Loading budgets...</p>
        </main>
      </>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#10B981]">
              <Target className="h-4 w-4" />
              Financial planning
            </p>

            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Budgets
            </h1>

            <p className="mt-3 max-w-2xl text-[#94A3B8]">
              Set spending limits and track how your expenses compare with
              your financial plans.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <section className="h-fit rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#10B981]/10 p-3 text-[#10B981]">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Create budget
                  </h2>
                  <p className="text-sm text-[#94A3B8]">
                    Set a spending limit
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm text-[#CBD5E1]">
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-[#334155] bg-[#111827] px-4 py-3 text-white outline-none focus:border-[#10B981]"
                  >
                    <option value="">Select category</option>

                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-[#CBD5E1]">
                    Spending limit
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.limit}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        limit: event.target.value,
                      })
                    }
                    placeholder="e.g. 10000"
                    className="mt-2 w-full rounded-xl border border-[#334155] bg-[#111827] px-4 py-3 text-white outline-none placeholder:text-[#64748B] focus:border-[#10B981]"
                  />
                </div>

                {/* <div>
                  <label className="text-sm text-[#CBD5E1]">
                    Period
                  </label>

                  <select
                    value={form.period}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        // period: event.target.value as BudgetPeriod,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-[#334155] bg-[#111827] px-4 py-3 text-white outline-none focus:border-[#10B981]"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div> */}

                {message && (
                  <p className="rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-sm text-[#CBD5E1]">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-[#10B981] px-4 py-3 font-semibold text-[#022C22] transition hover:bg-[#34D399] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Budget"}
                </button>
              </form>
            </section>

            <section>
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard
                  label="Total budget"
                  value={formatCurrency(totals.totalLimit)}
                />

                <SummaryCard
                  label="Total spent"
                  value={formatCurrency(totals.totalSpent)}
                />

                <SummaryCard
                  label="Remaining"
                  value={formatCurrency(totals.totalRemaining)}
                  tone={
                    totals.totalRemaining >= 0
                      ? "text-[#10B981]"
                      : "text-rose-400"
                  }
                />
              </div>

              <div className="mt-6 space-y-4">
                {budgets.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-[#334155] bg-[#0F172A]/70 p-10 text-center">
                    <Target className="mx-auto h-10 w-10 text-[#64748B]" />
                    <h2 className="mt-4 text-lg font-semibold">
                      No budgets yet
                    </h2>
                    <p className="mt-2 text-sm text-[#94A3B8]">
                      Create your first budget to start tracking expenses.
                    </p>
                  </div>
                ) : (
                  budgets.map((budget) => (
                    <BudgetCard
                      key={budget._id}
                      budget={budget}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <AppFooter />
    </>
  );
}

function SummaryCard({
  label,
  value,
  tone = "text-white",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-5">
      <p className="text-sm text-[#94A3B8]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tone}`}>
        {value}
      </p>
    </div>
  );
}

function BudgetCard({
  budget,
  onDelete,
}: {
  budget: BudgetItem;
  onDelete: (id: string) => void;
}) {
  const spent = budget.spent || 0;
  const percentageUsed = Math.min(
    budget.percentageUsed ??
    (budget.limit > 0 ? (spent / budget.limit) * 100 : 0),
    100
  );

  const isExceeded = spent > budget.limit;
  const isWarning = percentageUsed >= 80 && !isExceeded;

  const barColor = isExceeded
    ? "bg-rose-500"
    : isWarning
      ? "bg-amber-400"
      : "bg-[#10B981]";

  return (
    <article className="rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{budget.category}</h2>
          <p className="mt-1 text-sm capitalize text-[#94A3B8]">
            {budget.month}/{budget.year} budget
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDelete(budget._id)}
          className="rounded-xl p-2 text-[#94A3B8] transition hover:bg-rose-500/10 hover:text-rose-400"
          aria-label={`Delete ${budget.category} budget`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#94A3B8]">Spent</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatCurrency(spent)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-[#94A3B8]">Limit</p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(budget.limit)}
          </p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#1F2937]">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentageUsed}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span
          className={
            isExceeded
              ? "text-rose-400"
              : isWarning
                ? "text-amber-400"
                : "text-[#10B981]"
          }
        >
          {Math.round(percentageUsed)}% used
        </span>

        <span className="text-[#94A3B8]">
          {isExceeded
            ? `${formatCurrency(spent - budget.limit)} over`
            : `${formatCurrency(budget.limit - spent)} remaining`}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        {isExceeded || isWarning ? (
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
        )}

        <span className="text-[#CBD5E1]">
          {isExceeded
            ? "This budget has been exceeded."
            : isWarning
              ? "You are close to reaching this budget."
              : "You are within your budget."}
        </span>
      </div>
    </article>
  );
}