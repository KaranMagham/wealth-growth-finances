"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  Plus,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import AppFooter from "../../components/AppFooter";
import { useSession } from "@/hooks/useSession";
import {
  getGoalProgress,
  getGoalStatus,
} from "@/constants/goal";

interface Goal {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  completed: boolean;
  averageMonthlyContribution?: number;
  estimatedCompletionDate?: string | null;
  createdAt: string;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) =>
  currencyFormatter.format(value);

const initialForm = {
  name: "",
  targetAmount: "",
  currentAmount: "",
  targetDate: "",
};

export default function GoalsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [form, setForm] = useState(initialForm);
  const [contributions, setContributions] = useState<
    Record<string, string>
  >({});
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

    const loadGoals = async () => {
      try {
        const response = await fetch("/api/goals");
        const data = await response.json();

        if (data.success) {
          setGoals(data.goals || []);
        } else {
          setMessage(data.message || "Unable to load goals");
        }
      } catch (error) {
        console.error(error);
        setMessage("Unable to load goals");
      } finally {
        setLoading(false);
      }
    };

    void loadGoals();
  }, [status]);

  const summary = useMemo(() => {
    const totalTarget = goals.reduce(
      (sum, goal) => sum + goal.targetAmount,
      0
    );

    const totalCurrent = goals.reduce(
      (sum, goal) => sum + goal.currentAmount,
      0
    );

    const completedGoals = goals.filter(
      (goal) => goal.completed
    ).length;

    const overallProgress =
      totalTarget > 0
        ? Math.min(
            Math.round((totalCurrent / totalTarget) * 100),
            100
          )
        : 0;

    return {
      totalTarget,
      totalCurrent,
      completedGoals,
      overallProgress,
    };
  }, [goals]);

  const handleCreateGoal = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const targetAmount = Number(form.targetAmount);
    const currentAmount = Number(form.currentAmount || 0);

    if (!form.name.trim()) {
      setMessage("Enter a goal name");
      return;
    }

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setMessage("Enter a valid target amount");
      return;
    }

    if (currentAmount < 0 || currentAmount > targetAmount) {
      setMessage(
        "Current amount must be between ₹0 and the target amount"
      );
      return;
    }

    if (!form.targetDate) {
      setMessage("Select a target date");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          targetAmount,
          currentAmount,
          targetDate: form.targetDate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Unable to create goal");
        return;
      }

      setGoals((current) => [data.goal, ...current]);
      setForm(initialForm);
      setMessage("Goal created successfully");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleContribution = async (goalId: string) => {
    const amount = Number(contributions[goalId]);

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a valid contribution amount");
      return;
    }

    try {
      const response = await fetch(
        `/api/goals/${goalId}/contribute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Unable to add contribution");
        return;
      }

      setGoals((current) =>
        current.map((goal) =>
          goal._id === goalId ? data.goal : goal
        )
      );

      setContributions((current) => ({
        ...current,
        [goalId]: "",
      }));

      setMessage("Contribution added successfully");
    } catch (error) {
      console.error(error);
      setMessage("Unable to add contribution");
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!window.confirm("Delete this goal?")) {
      return;
    }

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Unable to delete goal");
        return;
      }

      setGoals((current) =>
        current.filter((goal) => goal._id !== goalId)
      );

      setMessage("Goal deleted");
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete goal");
    }
  };

  if (status === "loading" || loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
          <p className="text-[#94A3B8]">Loading goals...</p>
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
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#10B981]">
              <Target className="h-4 w-4" />
              Financial goals
            </div>

            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Goals
            </h1>

            <p className="mt-3 max-w-2xl text-[#94A3B8]">
              Set meaningful targets, track your progress, and build
              better financial habits.
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total target"
              value={formatCurrency(summary.totalTarget)}
              icon={<Target className="h-5 w-5" />}
            />

            <SummaryCard
              label="Saved so far"
              value={formatCurrency(summary.totalCurrent)}
              icon={<CircleDollarSign className="h-5 w-5" />}
              tone="text-[#10B981]"
            />

            <SummaryCard
              label="Overall progress"
              value={`${summary.overallProgress}%`}
              icon={<Trophy className="h-5 w-5" />}
            />

            <SummaryCard
              label="Completed goals"
              value={String(summary.completedGoals)}
              icon={<CheckCircle2 className="h-5 w-5" />}
              tone="text-[#10B981]"
            />
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
            <section className="h-fit rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#10B981]/10 p-3 text-[#10B981]">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Create goal
                  </h2>
                  <p className="text-sm text-[#94A3B8]">
                    Start planning your next milestone
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleCreateGoal}
                className="mt-6 space-y-4"
              >
                <Field
                  label="Goal name"
                  type="text"
                  placeholder="e.g. Emergency Fund"
                  value={form.name}
                  onChange={(value) =>
                    setForm({ ...form, name: value })
                  }
                />

                <Field
                  label="Target amount"
                  type="number"
                  placeholder="e.g. 100000"
                  value={form.targetAmount}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      targetAmount: value,
                    })
                  }
                />

                <Field
                  label="Current amount"
                  type="number"
                  placeholder="e.g. 15000"
                  value={form.currentAmount}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      currentAmount: value,
                    })
                  }
                />

                <Field
                  label="Target date"
                  type="date"
                  value={form.targetDate}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      targetDate: value,
                    })
                  }
                />

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
                  {saving ? "Creating..." : "Create Goal"}
                </button>
              </form>
            </section>

            <section className="space-y-4">
              {goals.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-[#334155] bg-[#0F172A]/70 p-10 text-center">
                  <Target className="mx-auto h-10 w-10 text-[#64748B]" />
                  <h2 className="mt-4 text-lg font-semibold">
                    No goals yet
                  </h2>
                  <p className="mt-2 text-sm text-[#94A3B8]">
                    Create your first goal to start tracking progress.
                  </p>
                </div>
              ) : (
                goals.map((goal) => (
                  <GoalCard
                    key={goal._id}
                    goal={goal}
                    contribution={contributions[goal._id] || ""}
                    onContributionChange={(value) =>
                      setContributions((current) => ({
                        ...current,
                        [goal._id]: value,
                      }))
                    }
                    onContribute={() =>
                      handleContribution(goal._id)
                    }
                    onDelete={() => handleDelete(goal._id)}
                  />
                ))
              )}
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
  icon,
  tone = "text-white",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-5">
      <div className="flex items-center gap-3 text-[#10B981]">
        {icon}
        <p className="text-sm text-[#94A3B8]">{label}</p>
      </div>

      <p className={`mt-3 text-2xl font-semibold ${tone}`}>
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-[#CBD5E1]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={type === "number" ? "0" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[#334155] bg-[#111827] px-4 py-3 text-white outline-none placeholder:text-[#64748B] focus:border-[#10B981]"
      />
    </div>
  );
}

function GoalCard({
  goal,
  contribution,
  onContributionChange,
  onContribute,
  onDelete,
}: {
  goal: Goal;
  contribution: string;
  onContributionChange: (value: string) => void;
  onContribute: () => void;
  onDelete: () => void;
}) {
  const progress = getGoalProgress(
    goal.currentAmount,
    goal.targetAmount
  );

  const goalStatus = goal.completed
    ? "Congratulations — goal achieved"
    : getGoalStatus(progress);

  const remaining = Math.max(
    goal.targetAmount - goal.currentAmount,
    0
  );

  return (
    <article className="rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {goal.completed && (
              <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
            )}

            <h2 className="text-xl font-semibold">
              {goal.name}
            </h2>
          </div>

          <p className="mt-1 text-sm text-[#94A3B8]">
            {goalStatus}
          </p>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl p-2 text-[#94A3B8] transition hover:bg-rose-500/10 hover:text-rose-400"
          aria-label={`Delete ${goal.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#94A3B8]">Progress</p>
          <p className="mt-1 text-3xl font-semibold">
            {formatCurrency(goal.currentAmount)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-[#94A3B8]">Target</p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(goal.targetAmount)}
          </p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#1F2937]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-[#10B981]">
          {progress}% complete
        </span>

        <span className="text-[#94A3B8]">
          {formatCurrency(remaining)} remaining
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-[#1F2937] bg-[#111827]/70 p-3">
          <p className="text-[#64748B]">Target date</p>
          <p className="mt-1 text-[#CBD5E1]">
            {new Date(goal.targetDate).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}
          </p>
        </div>

        <div className="rounded-xl border border-[#1F2937] bg-[#111827]/70 p-3">
          <p className="text-[#64748B]">
            Estimated completion
          </p>
          <p className="mt-1 text-[#CBD5E1]">
            {goal.estimatedCompletionDate
              ? new Date(
                  goal.estimatedCompletionDate
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Add contributions to estimate"}
          </p>
        </div>
      </div>

      {!goal.completed && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            type="number"
            min="1"
            value={contribution}
            onChange={(event) =>
              onContributionChange(event.target.value)
            }
            placeholder="Contribution amount"
            className="min-w-0 flex-1 rounded-xl border border-[#334155] bg-[#111827] px-4 py-3 text-white outline-none placeholder:text-[#64748B] focus:border-[#10B981]"
          />

          <button
            type="button"
            onClick={onContribute}
            className="rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-5 py-3 font-semibold text-[#D4F2D3] transition hover:bg-[#10B981]/20"
          >
            Add contribution
          </button>
        </div>
      )}
    </article>
  );
}