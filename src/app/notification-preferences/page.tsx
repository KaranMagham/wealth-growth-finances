"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import {
    ArrowLeft,
    Banknote,
    Bell,
    CreditCard,
    Loader2,
    Receipt,
    Save,
    ShieldAlert,
    Sparkles,
    Target,
    TrendingUp,
    Wallet,
} from "lucide-react";

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
    icon: typeof Bell;
}[] = [
        { key: "budget", label: "Budget", icon: Wallet },
        { key: "payment", label: "Payment", icon: CreditCard },
        { key: "transaction", label: "Transaction", icon: Receipt },
        { key: "balance", label: "Balance", icon: Banknote },
        { key: "goal", label: "Goal", icon: Target },
        { key: "weekly_summary", label: "Weekly summary", icon: TrendingUp },
        { key: "monthly_summary", label: "Monthly summary", icon: TrendingUp },
        { key: "investment", label: "Investment", icon: TrendingUp },
        { key: "ai_insight", label: "AI insight", icon: Sparkles },
        { key: "security", label: "Security", icon: ShieldAlert },
        { key: "system", label: "System", icon: Bell },
    ];

export default function NotificationPreferencesPage() {
    const { status, session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [preferences, setPreferences] = useState<Preferences | null>(null);

    const userId = session?.user?.id;

    useEffect(() => {
        let cancelled = false;

        async function loadPreferences() {
            if (!userId) return;
            try {
                const response = await fetch("/api/notification-preferences", {
                    cache: "no-store",
                });
                if (!response.ok) throw new Error("Failed to load preferences");
                const data = await response.json();

                if (!cancelled) {
                    setPreferences(data.preferences ?? null);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to load notification preferences:", error);
                if (!cancelled) setLoading(false);
            }
        }

        if (userId) loadPreferences();
        return () => {
            cancelled = true;
        };
    }, [userId]);

    async function savePreferences() {
        if (!userId || !preferences) return;

        setSaving(true);
        setSaved(false);

        try {
            const response = await fetch("/api/notification-preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(preferences),
            });
            if (!response.ok) throw new Error("Failed to save preferences");
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Failed to save notification preferences:", error);
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
            [category]: { ...preferences[category], [channel]: value },
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
                    <h1 className="mt-4 text-2xl font-bold">Sign in to manage preferences</h1>
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
                    <Link
                        href="/profile"
                        className="mb-4 inline-flex items-center gap-2 rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-sm font-medium text-[#94A3B8] transition hover:border-[#475569] hover:text-[#F8FAFC]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to profile
                    </Link>
                    <h1 className="text-2xl font-bold">Notification preferences</h1>
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
                <Link
                    href="/profile"
                    className="mb-4 inline-flex items-center gap-2 rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-sm font-medium text-[#94A3B8] transition-all duration-200 hover:-translate-x-0.5 hover:border-[#475569] hover:text-[#F8FAFC]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to profile
                </Link>

                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl border border-[#10B981]/20 bg-gradient-to-br from-[#064E3B] via-[#0F172A] to-[#111827] p-6 shadow-2xl shadow-[#10B981]/10 sm:p-8">
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#10B981]/20 blur-3xl" />
                    <div className="absolute -bottom-20 left-10 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl" />

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

                <section className="mt-8 space-y-4">
                    {/* Master toggle */}
                    <div className="flex items-center justify-between rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 p-5">
                        <div>
                            <p className="text-sm font-bold text-[#F8FAFC]">Enable all notifications</p>
                            <p className="mt-0.5 text-xs text-[#94A3B8]">
                                Turn everything off at once, or fine-tune categories below.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.enabled}
                            onChange={(e) => setPreferences({ ...preferences, enabled: e.target.checked })}
                            className="h-5 w-5 accent-[#10B981]"
                        />
                    </div>

                    {/* Category cards */}
                    <div
                        className={`space-y-4 transition-opacity duration-300 ${preferences.enabled ? "opacity-100" : "pointer-events-none opacity-40"
                            }`}
                    >
                        {categories.map((cat, index) => {
                            const Icon = cat.icon;
                            const pref = preferences[cat.key];
                            const activeCount = [pref.inApp, pref.desktop, pref.email].filter(Boolean).length;

                            return (
                                <div
                                    key={cat.key}
                                    style={{ animationDelay: `${index * 30}ms` }}
                                    className="animate-[fadeSlideIn_0.3s_ease-out_backwards] rounded-2xl border border-[#334155] bg-[#111827] p-5 transition-colors duration-200 hover:border-[#475569]"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-2 text-[#94A3B8]">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <p className="text-sm font-semibold text-[#F8FAFC]">{cat.label}</p>
                                        </div>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${activeCount > 0
                                                ? "bg-[#10B981]/15 text-[#6EE7B7]"
                                                : "bg-[#1E293B] text-[#64748B]"
                                                }`}
                                        >
                                            {activeCount === 0 ? "Off" : `${activeCount} channel${activeCount > 1 ? "s" : ""}`}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#334155] pt-4 sm:grid-cols-3">
                                        <label className="flex items-center justify-between gap-3 sm:flex-col sm:items-start sm:gap-2">
                                            <span className="text-xs font-medium text-[#CBD5E1]">In-app</span>
                                            <input
                                                type="checkbox"
                                                checked={pref.inApp}
                                                onChange={(e) => updateChannel(cat.key, "inApp", e.target.checked)}
                                                className="h-5 w-5 accent-[#10B981]"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between gap-3 sm:flex-col sm:items-start sm:gap-2">
                                            <span className="text-xs font-medium text-[#CBD5E1]">Desktop</span>
                                            <input
                                                type="checkbox"
                                                checked={pref.desktop}
                                                onChange={(e) => updateChannel(cat.key, "desktop", e.target.checked)}
                                                className="h-5 w-5 accent-[#10B981]"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between gap-3 sm:flex-col sm:items-start sm:gap-2">
                                            <span className="text-xs font-medium text-[#CBD5E1]">Email</span>
                                            <input
                                                type="checkbox"
                                                checked={pref.email}
                                                onChange={(e) => updateChannel(cat.key, "email", e.target.checked)}
                                                className="h-5 w-5 accent-[#10B981]"
                                            />
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Save bar */}
                    <div className="sticky bottom-4 flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={savePreferences}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl border border-[#10B981]/40 bg-[#10B981] px-5 py-3 text-sm font-semibold text-[#0F172A] shadow-lg shadow-[#10B981]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0DA271] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : saved ? (
                                <>
                                    <Save className="h-4 w-4" />
                                    Saved
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save preferences
                                </>
                            )}

                        </button>
                    </div>
                </section>
            </div>

            <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </main>
    );
}