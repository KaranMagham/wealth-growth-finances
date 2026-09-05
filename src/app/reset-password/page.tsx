"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Loader2, ShieldCheck, Sparkles } from "lucide-react";

import Navbar from "../../../components/Navbar";

function passwordIsValid(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const tokenError = searchParams.get("error");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(token && !tokenError ? "idle" : "error");
  const [message, setMessage] = useState(tokenError ? "This password reset link is invalid or has expired." : "");

  const canSubmit = Boolean(token) && passwordIsValid(password) && password === confirmation && status !== "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to reset password.");
      setStatus("success");
      setPassword("");
      setConfirmation("");
      setMessage("Your password has been changed. You can now sign in.");
    } catch (resetError) {
      setStatus("error");
      setMessage(resetError instanceof Error ? resetError.message : "Unable to reset password.");
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-[32px] border border-[#334155] bg-[#0F172A]/90 p-6 shadow-[0_0_50px_rgba(16,185,129,0.12)] sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-2 text-sm font-semibold text-[#D4F2D3]">
          <Sparkles className="h-4 w-4 text-[#10B981]" />
          Password Recovery
        </div>
        <h1 className="mt-6 text-3xl font-semibold">Choose a new password</h1>
        <p className="mt-3 text-sm leading-6 text-[#94A3B8]">Use a strong password to secure your Wealth Growth account.</p>

        {message && (
          <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${status === "success" ? "border-[#10B981]/40 bg-[#10B981]/10 text-[#D1FAE5]" : "border-rose-400/40 bg-rose-500/10 text-rose-100"}`}>
            <div className="flex items-start gap-3">
              {status === "success" ? <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" /> : <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />}
              <p>{message}</p>
            </div>
          </div>
        )}

        {token && !tokenError && status !== "success" && (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[#E2E8F0]">
              New password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="mt-2 w-full rounded-3xl border border-[#334155] bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-[#10B981]" />
            </label>
            <label className="block text-sm font-medium text-[#E2E8F0]">
              Confirm new password
              <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" className="mt-2 w-full rounded-3xl border border-[#334155] bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-[#10B981]" />
            </label>
            <p className="text-xs leading-5 text-[#94A3B8]">Use at least 8 characters with an uppercase letter, number, and symbol.</p>
            <button type="submit" disabled={!canSubmit} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-[#020617] transition hover:bg-[#34d399] disabled:cursor-not-allowed disabled:bg-[#334155] disabled:text-[#94A3B8]">
              {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" />Updating password...</> : "Update password"}
            </button>
          </form>
        )}

        <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#10B981] hover:text-[#34d399]"><ArrowLeft className="h-4 w-4" />Back to sign in</Link>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <><Navbar /><Suspense fallback={<main className="min-h-screen bg-[#020617]" />}><ResetPasswordForm /></Suspense></>;
}