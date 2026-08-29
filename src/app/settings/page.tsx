"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionClient } from "@/lib/session-client";
import Navbar from "../../../components/Navbar";
import AppFooter from "../../components/AppFooter";
import {
  Settings as SettingsIcon,
  BellRing,
  ShieldCheck,
  IndianRupee,
  Bot,
  LogOut,
  Smartphone,
  Key,
  Mail,
  Monitor,
  Database,
  Target,
  TrendingUp,
  PiggyBank,
  Brain,
} from "lucide-react";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  image?: string | null;
  createdAt?: string;
};

type ToggleState = Record<string, boolean>;

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Notification toggles
  const [notificationToggles, setNotificationToggles] = useState<ToggleState>({
    enableNotifications: true,
    budgetAlerts: true,
    emiBillReminders: true,
    goalMilestones: true,
    largeTransactionAlerts: true,
    lowBalanceAlerts: true,
    investmentAlerts: true,
    aiRecommendations: true,
    weeklySummary: true,
    monthlySummary: true,
  });

  const [channelToggles, setChannelToggles] = useState<ToggleState>({
    inApp: true,
    desktop: true,
    email: true,
  });

  // Security (UI only for now)
  const [securityToggles, setSecurityToggles] = useState<ToggleState>({
    loginNotifications: true,
  });

  // Financial preferences
  const [currency, setCurrency] = useState("INR");
  const [numberFormat, setNumberFormat] = useState("Indian");
  const [analysisPeriod, setAnalysisPeriod] = useState("This Month");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [showDecimals, setShowDecimals] = useState(true);

  // AI settings
  const [aiToggles, setAiToggles] = useState<ToggleState>({
    personalizedAdvice: true,
    useFinancialHistory: true,
    budgetRecommendations: true,
    investmentInsights: true,
    goalSuggestions: true,
    aiNotifications: true,
  });
  const [aiStyle, setAiStyle] = useState<"Concise" | "Balanced" | "Detailed">(
    "Balanced"
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const result = await getSessionClient();
      if (cancelled) return;

      if (!result.success || !result.session?.user) {
        router.push("/login");
        return;
      }

      setUser(result.session.user as SessionUser);
      setLoading(false);
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#0F172A] px-4 py-12 text-[#F8FAFC]">
          <div className="mx-auto max-w-5xl animate-pulse">
            <div className="h-40 rounded-3xl border border-[#334155] bg-[#111827]" />
            <div className="mt-8 space-y-6">
              <div className="h-56 rounded-3xl border border-[#334155] bg-[#111827]" />
              <div className="h-56 rounded-3xl border border-[#334155] bg-[#111827]" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    // TODO: send full settings object to /api/settings later
    // await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ... }) });

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 600);
  }

  function updateNotification(key: string, value: boolean) {
    setNotificationToggles((prev) => ({ ...prev, [key]: value }));
  }

  function updateChannel(key: string, value: boolean) {
    setChannelToggles((prev) => ({ ...prev, [key]: value }));
  }

  function updateSecurity(key: string, value: boolean) {
    setSecurityToggles((prev) => ({ ...prev, [key]: value }));
  }

  function updateAi(key: string, value: boolean) {
    setAiToggles((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0F172A] px-4 py-8 text-[#F8FAFC] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-[#10B981]/20 bg-gradient-to-br from-[#064E3B] via-[#0F172A] to-[#111827] p-6 shadow-2xl shadow-[#10B981]/10 sm:p-8">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#10B981]/20 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl" />

            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#10B981]/30 bg-[#10B981]/20 text-[#6EE7B7]">
                <SettingsIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6EE7B7]">
                  Settings
                </p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
                  App preferences
                </h1>
              </div>
            </div>
          </section>

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            {/* 1. Notification Settings */}
            <section className="rounded-3xl border border-[#334155] bg-[#111827] p-6 shadow-lg sm:p-8">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-[#64748B]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
                  Notification Settings
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Notification controls */}
                <div>
                  <h3 className="text-sm font-semibold text-[#CBD5E1]">
                    Notifications
                  </h3>
                  <div className="mt-3 space-y-3">
                    <ToggleRow
                      label="Enable notifications"
                      checked={notificationToggles.enableNotifications}
                      onChange={(v) => updateNotification("enableNotifications", v)}
                    />
                    <ToggleRow
                      label="Budget alerts"
                      checked={notificationToggles.budgetAlerts}
                      onChange={(v) => updateNotification("budgetAlerts", v)}
                    />
                    <ToggleRow
                      label="EMI / Bill reminders"
                      checked={notificationToggles.emiBillReminders}
                      onChange={(v) => updateNotification("emiBillReminders", v)}
                    />
                    <ToggleRow
                      label="Goal milestones"
                      checked={notificationToggles.goalMilestones}
                      onChange={(v) => updateNotification("goalMilestones", v)}
                    />
                    <ToggleRow
                      label="Large transaction alerts"
                      checked={notificationToggles.largeTransactionAlerts}
                      onChange={(v) =>
                        updateNotification("largeTransactionAlerts", v)
                      }
                    />
                    <ToggleRow
                      label="Low balance alerts"
                      checked={notificationToggles.lowBalanceAlerts}
                      onChange={(v) => updateNotification("lowBalanceAlerts", v)}
                    />
                    <ToggleRow
                      label="Investment alerts"
                      checked={notificationToggles.investmentAlerts}
                      onChange={(v) => updateNotification("investmentAlerts", v)}
                    />
                    <ToggleRow
                      label="AI recommendations"
                      checked={notificationToggles.aiRecommendations}
                      onChange={(v) => updateNotification("aiRecommendations", v)}
                    />
                    <ToggleRow
                      label="Weekly financial summary"
                      checked={notificationToggles.weeklySummary}
                      onChange={(v) => updateNotification("weeklySummary", v)}
                    />
                    <ToggleRow
                      label="Monthly financial summary"
                      checked={notificationToggles.monthlySummary}
                      onChange={(v) => updateNotification("monthlySummary", v)}
                    />
                  </div>
                </div>

                {/* Delivery channels */}
                <div>
                  <h3 className="text-sm font-semibold text-[#CBD5E1]">
                    Delivery channels
                  </h3>
                  <div className="mt-3 space-y-3">
                    <ToggleRow
                      label={
                        <span className="inline-flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-[#64748B]" />
                          In‑app
                        </span>
                      }
                      checked={channelToggles.inApp}
                      onChange={(v) => updateChannel("inApp", v)}
                    />
                    <ToggleRow
                      label={
                        <span className="inline-flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-[#64748B]" />
                          Desktop
                        </span>
                      }
                      checked={channelToggles.desktop}
                      onChange={(v) => updateChannel("desktop", v)}
                    />
                    <ToggleRow
                      label={
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#64748B]" />
                          Email
                        </span>
                      }
                      checked={channelToggles.email}
                      onChange={(v) => updateChannel("email", v)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Security */}
            <section className="rounded-3xl border border-[#334155] bg-[#111827] p-6 shadow-lg sm:p-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#64748B]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
                  Security
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <SettingsLink label="Change Password" />
                  <SettingsLink label="Passkeys" />
                  <SettingsLink label="Authenticator App (TOTP)" />
                  <SettingsLink label="Active Sessions" />
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-[#334155] bg-[#0F172A]/60 px-4 py-3 text-left text-sm text-[#CBD5E1] transition hover:border-[#475569] hover:bg-[#0F172A]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LogOut className="h-4 w-4 text-[#64748B]" />
                      Sign out of all devices
                    </span>
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#CBD5E1]">
                    Login security
                  </h3>
                  <div className="mt-3 space-y-3">
                    <ToggleRow
                      label="Login notifications"
                      checked={securityToggles.loginNotifications}
                      onChange={(v) => updateSecurity("loginNotifications", v)}
                    />
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div className="mt-6 border-t border-[#334155] pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">
                  Danger Zone
                </h3>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  Once you delete your account, there is no going back.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
                >
                  Delete Account
                </button>
              </div>
            </section>

            {/* 3. Financial Preferences */}
            <section className="rounded-3xl border border-[#334155] bg-[#111827] p-6 shadow-lg sm:p-8">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-[#64748B]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
                  Financial Preferences
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  label="Currency"
                  value={currency}
                  onChange={setCurrency}
                  options={["INR", "USD", "EUR"]}
                  renderOption={(v) =>
                    v === "INR"
                      ? "₹ INR"
                      : v === "USD"
                      ? "$ USD"
                      : "€ EUR"
                  }
                />
                <SelectField
                  label="Number Format"
                  value={numberFormat}
                  onChange={setNumberFormat}
                  options={["Indian", "International"]}
                />
                <SelectField
                  label="Default Analysis Period"
                  value={analysisPeriod}
                  onChange={setAnalysisPeriod}
                  options={[
                    "This Month",
                    "Last Month",
                    "Last 3 Months",
                    "Last 6 Months",
                    "This Year",
                  ]}
                />
                <SelectField
                  label="Default Date Format"
                  value={dateFormat}
                  onChange={setDateFormat}
                  options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
                />
                <div className="sm:col-span-2">
                  <ToggleRow
                    label="Show decimal values"
                    checked={showDecimals}
                    onChange={setShowDecimals}
                  />
                </div>
              </div>
            </section>

            {/* 4. AI Assistant */}
            <section className="rounded-3xl border border-[#334155] bg-[#111827] p-6 shadow-lg sm:p-8">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-[#64748B]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
                  AI Assistant
                </h2>
              </div>

              <p className="mt-2 text-sm text-[#94A3B8]">
                AI Assistant uses your recorded financial data to provide
                personalized financial insights and recommendations.
              </p>
                <div>
                  <h3 className="text-sm font-semibold text-[#CBD5E1]">
                    Capabilities
                  </h3>
                  <div className="mt-3 space-y-3">
                    <ToggleRow
                      label={
                        <span className="inline-flex items-center gap-2">
                          <Brain className="h-4 w-4 text-[#64748B]" />
                          Personalized financial advice
                        </span>
                      }
                      checked={aiToggles.personalizedAdvice}
                      onChange={(v) => updateAi("personalizedAdvice", v)}
                    />
                    <ToggleRow
                      label={
                        <span className="inline-flex items-center gap-2">
                          <Database className="h-4 w-4 text-[#64748B]" />
                          Use financial history
                        </span>
                      }
                      checked={aiToggles.useFinancialHistory}
                      onChange={(v) => updateAi("useFinancialHistory", v)}
                    />
                    <ToggleRow
                      label={
                        <span className="inline-flex items-center gap-2">
                          <PiggyBank className="h-4 w-4 text-[#64748B]" />
                          Budget recommendations
                        </span>
                      }
                      checked={aiToggles.budgetRecommendations}
                      onChange={(v) => updateAi("budgetRecommendations", v)}
                    />
                    <ToggleRow
                      label={
                        <span className="inline-flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-[#64748B]" />
                          Investment insights
                        </span>
                      }
                      checked={aiToggles.investmentInsights}
                      onChange={(v) => updateAi("investmentInsights", v)}
                    />
                    <ToggleRow
                      label={
                        <span className="inline-flex items-center gap-2">
                          <Target className="h-4 w-4 text-[#64748B]" />
                          Goal planning suggestions
                        </span>
                      }
                      checked={aiToggles.goalSuggestions}
                      onChange={(v) => updateAi("goalSuggestions", v)}
                    />
                    <ToggleRow
                      label="AI notifications"
                      checked={aiToggles.aiNotifications}
                      onChange={(v) => updateAi("aiNotifications", v)}
                    />
                  </div>
                </div>
            </section>

            {/* Save bar */}
            <div className="flex items-center gap-3 border-t border-[#334155] pt-6">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#34D399] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save settings"}
              </button>

              {saved && (
                <span className="text-sm text-[#6EE7B7]">
                  Settings saved (demo only)
                </span>
              )}
            </div>
          </form>
        </div>
      </main>
      <AppFooter />
    </>
  );
}

/* Small reusable components */

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-[#334155] bg-[#0F172A]/60 px-4 py-3 text-sm text-[#CBD5E1] transition hover:border-[#475569] hover:bg-[#0F172A]">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#10B981]"
      />
    </label>
  );
}

function SettingsLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-xl border border-[#334155] bg-[#0F172A]/60 px-4 py-3 text-left text-sm text-[#CBD5E1] transition hover:border-[#475569] hover:bg-[#0F172A]"
    >
      <span>{label}</span>
      <span className="text-[#64748B]">→</span>
    </button>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  renderOption,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  renderOption?: (v: string) => string;
}) {
  return (
    <div className="rounded-2xl border border-[#334155] bg-[#0F172A]/60 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
        {label}
      </dt>
      <dd className="mt-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#10B981] focus:outline-none"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {renderOption ? renderOption(opt) : opt}
            </option>
          ))}
        </select>
      </dd>
    </div>
  );
}