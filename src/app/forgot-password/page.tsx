"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react"
import Navbar from "../../../components/Navbar"
import Footer from "../../../components/Footer"

type FormStatus = "idle" | "loading" | "success" | "error"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<FormStatus>("idle")
  const [message, setMessage] = useState("")

  const emailValid = isValidEmail(email)
  const canSubmit = emailValid && status !== "loading"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus("error")
        setMessage(data.message || "Unable to send reset instructions right now.")
        return
      }

      setStatus("success")
      setMessage(data.message || "Check your inbox for the reset link.")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)] text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-[32px] border border-[#334155] bg-[#0F172A]/90 p-6 shadow-[0_0_50px_rgba(16,185,129,0.12)] sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-2 text-sm font-semibold text-[#D4F2D3]">
              <Sparkles className="h-4 w-4 text-[#10B981]" />
              Password Recovery
            </div>

            <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
              Forgot your password?
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#94A3B8] sm:text-base">
              Enter the email attached to your account and we’ll send step-by-step instructions to reset it.
            </p>

            {status === "success" && (
              <div className="mt-6 rounded-2xl border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-3 text-sm text-[#D1FAE5]">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
                  <div>
                    <p className="font-semibold text-white">Request received</p>
                    <p className="mt-1">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="mt-6 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <p className="font-semibold text-white">Unable to continue</p>
                <p className="mt-1">{message}</p>
              </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#E2E8F0]">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-3xl border border-[#334155] bg-[#111827] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20"
                  />
                </div>
                {email.length > 0 && !emailValid && (
                  <p className="text-xs text-rose-300">Enter a valid email address.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${canSubmit
                  ? "bg-[#10B981] text-[#020617] hover:bg-[#34d399]"
                  : "cursor-not-allowed bg-[#334155] text-[#94A3B8]"}`}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending reset instructions...
                  </>
                ) : (
                  "Send reset instructions"
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#10B981] hover:text-[#34d399]">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
