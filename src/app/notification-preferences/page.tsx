"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { Bell, Loader2, Save } from "lucide-react";

type ChannelPreference = {
  inApp: boolean;
  desktop: boolean;
  email: boolean;
};

type CategoryKey =
  | "budget"
  | "payment"
  | "transaction"
  | "balance"
  | "goal"
  | "weekly_summary"
  | "monthly_summary"
  | "investment"
  | "ai_insight"
  | "security"
  | "system";

type Preferences = {
  enabled: boolean;
  budget: ChannelPreference;
  payment: ChannelPreference;
  transaction: ChannelPreference;
  balance: ChannelPreference;
  goal: ChannelPreference;
  weekly_summary: ChannelPreference;
  monthly_summary: ChannelPreference;
  investment: ChannelPreference;
  ai_insight: ChannelPreference;
  security: ChannelPreference;
  system: ChannelPreference;
};

const categories: {
  key: CategoryKey;
  label: string;
}[] = [
  { key: "budget", label: "Budget" },
  { key: "payment", label: "Payment" },
  { key: "transaction", label: "Transaction" },
  { key: "balance", label: "Balance" },
  { key: "goal", label: "Goal" },
  { key: "weekly_summary", label: "Weekly summary" },
  { key: "monthly_summary", label: "Monthly summary" },
  { key: "investment", label: "Investment" },
  { key: "ai_insight", label: "AI insight" },
  { key: "security", label: "Security" },
  { key: "system", label: "System" },
];

export default function NotificationPreferencesPage() {
  const { status, session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] =
    useState<Preferences | null>(null);

  const userId = session?.user?.id;

  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      if (!userId) {
        return;
      }

      try {
        const response = await fetch(
          "/api/notification-preferences",
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Failed to load preferences");
        }

        const data = await response.json();

        if (!cancelled) {
          setPreferences(data.preferences ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Failed to load notification preferences:",
          error
        );

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (userId) {
      loadPreferences();
    }

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function savePreferences() {
    if (!userId || !preferences) return;

    setSaving(true);

    try {
      const response = await fetch(
        "/api/notification-preferences",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preferences),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error(
        "Failed to save notification preferences:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  function updateChannel(
    category: CategoryKey,
    channel: keyof ChannelPreference,
    value: boolean
  ) {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [category]: {
        ...preferences[category],
        [channel]: value,
      },
    });
  }

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="flex items-center gap-3 text-[#F8FAFC]">
          <Loader2 className="h-6 w-6 animate-spin text-[#10B981]" />
          <span>Loading preferences…</span>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 text-[#F8FAFC]">
        <div className="w-full max-w-md rounded-3xl border border-[#334155] bg-[#111827] p-8 text-center shadow-2xl">
          <Bell className="mx-auto h-12 w-12 text-[#10B981]" />
          <h1 className="mt-4 text-2xl font-bold">
            Sign in to manage preferences
          </h1>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Control how you receive budget alerts and insights.
          </p>
        </div>
      </main>
    );
  }

  if (!preferences) {
    return (
      <main className="min-h-screen bg-[#0F172A] px-4 py-12 text-[#F8FAFC]">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold">
            Notification preferences
          </h1>
          <p className="mt-2 text-sm text-[#94A3B8]">
            No preferences found. Saving will create them.
          </p>

          <div className="mt-8 rounded-2xl border border-[#334155] bg-[#111827] p-6">
            <p className="text-sm text-[#CBD5E1]">
              Enable notifications to start receiving alerts.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-12 text-[#F8FAFC]">
      <div className="mx-auto max-w-3xl">
        <section className="relative overflow-hidden rounded-3xl border border-[#10B981]/20 bg-gradient-to-br from-[#064E3B] via-[#0F172A] to-[#111827] p-6 shadow-2xl shadow-[#10B981]/10 sm:p-8">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#10B981]/20 blur-3xl" />

          <div className="relative flex items-start gap-4">
            <div className="rounded-2xl border border-[#10B981]/30 bg-[#10B981]/20 p-3">
              <Bell className="h-7 w-7 text-[#6EE7B7]" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6EE7B7]">
                Control center
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                Notification preferences
              </h1>
              <p className="mt-2 text-sm text-[#CBD5E1]">
                Choose how you want to be notified.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-6">
          <div className="rounded-2xl border border-[#334155] bg-[#111827] p-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Enable all notifications
              </span>
              <input
                type="checkbox"
                checked={preferences.enabled}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    enabled: e.target.checked,
                  })
                }
                className="h-5 w-5 accent-[#10B981]"
              />
            </label>
          </div>

          {categories.map((cat) => (
            <div
              key={cat.key}
              className="rounded-2xl border border-[#334155] bg-[#111827] p-4"
            >
              <p className="mb-3 text-sm font-semibold">
                {cat.label}
              </p>

              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-[#CBD5E1]">
                    In-app
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences[cat.key].inApp}
                    onChange={(e) =>
                      updateChannel(
                        cat.key,
                        "inApp",
                        e.target.checked
                      )
                    }
                    className="h-5 w-5 accent-[#10B981]"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-[#CBD5E1]">
                    Desktop
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences[cat.key].desktop}
                    onChange={(e) =>
                      updateChannel(
                        cat.key,
                        "desktop",
                        e.target.checked
                      )
                    }
                    className="h-5 w-5 accent-[#10B981]"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-[#CBD5E1]">
                    Email
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences[cat.key].email}
                    onChange={(e) =>
                      updateChannel(
                        cat.key,
                        "email",
                        e.target.checked
                      )
                    }
                    className="h-5 w-5 accent-[#10B981]"
                  />
                </label>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={savePreferences}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-5 py-3 text-sm font-semibold text-[#6EE7B7] transition hover:bg-[#10B981]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save preferences
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}