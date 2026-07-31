"use client"

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Wallet,
  LineChart,
  Bot,
  Zap,
  LayoutDashboard,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { SiGithub, SiGoogle } from '@icons-pack/react-simple-icons'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

const benefits = [
  {
    icon: Wallet,
    title: 'Continue Tracking Expenses',
    description: 'Pick up where you left off and keep your spending organized.',
  },
  {
    icon: LineChart,
    title: 'Monitor Your Investments',
    description: 'Check portfolio progress and stay aligned with your goals.',
  },
  {
    icon: Bot,
    title: 'AI Insights Await',
    description: 'Get personalized recommendations based on your latest activity.',
  },
  {
    icon: LayoutDashboard,
    title: 'Secure Access to Your Dashboard',
    description: 'Sign in safely and manage your finances from one place.',
  },
]

const trustBadges = [
  {
    icon: Lock,
    label: 'Bank-Level Security',
  },
  {
    icon: Zap,
    label: '30 Second Setup',
  },
  {
    icon: Bot,
    label: 'AI Powered',
  },
]

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const emailValid = isValidEmail(email)
  const router = useRouter()
  const canSubmit = emailValid && password.length >= 4 && status !== 'loading'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.message || "Invalid credentials");
        return;
      }

      setStatus("success");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      setStatus("error")
      setErrorMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <>
      <Navbar />

      <main className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#10B981]/20 blur-[140px]" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="space-y-8 lg:pt-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-2 text-sm font-semibold text-[#D4F2D3] shadow-[0_0_20px_rgba(16,185,129,0.08)]">
                <Sparkles className="h-4 w-4 text-[#10B981]" />
                Continue Your Financial Journey
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  Welcome Back to
                  <span className="block text-[#10B981]">Wealth Growth</span>
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[#CBD5E1] sm:text-lg">
                  Welcome back! Sign in to continue tracking your finances, monitor investments, and stay on top of your financial goals.
                </p>
              </div>

              <div className="grid gap-4 rounded-[32px] border border-[#334155] bg-[#111827]/90 p-6 shadow-[0_0_40px_rgba(16,185,129,0.14)]">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon
                  return (
                    <div
                      key={benefit.title}
                      className="space-y-2 rounded-[24px] border border-[#1F2937] bg-[#0F172A]/80 p-5 transition hover:scale-[1.02] hover:border-[#10B981]/90 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="text-base font-semibold text-white">{benefit.title}</h3>
                      </div>
                      <p className="text-sm leading-6 text-[#94A3B8]">{benefit.description}</p>
                    </div>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {trustBadges.map((badge) => {
                  const Icon = badge.icon
                  return (
                    <span
                      key={badge.label}
                      className="inline-flex items-center justify-center gap-2 rounded-[24px] border border-[#334155] bg-[#111827]/80 px-4 py-4 text-sm font-semibold text-[#E2E8F0] transition hover:border-[#10B981]/60"
                    >
                      <Icon className="h-4 w-4 text-[#10B981]" />
                      {badge.label}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[32px] border border-[#334155] bg-[#0F172A]/90 p-8 shadow-[0_0_50px_rgba(16,185,129,0.12)] sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Sign In</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Sign in to Wealth Growth</h2>
                <p className="mt-4 text-sm leading-6 text-[#94A3B8]">
                  Access your dashboard and continue managing your finances securely.
                </p>

                {status === 'success' && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-3 text-sm text-[#D1FAE5]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
                    <div>
                      <p className="font-semibold text-white">Signed In</p>
                      <p className="mt-1 text-[#A7F3D0]">Redirecting to your dashboard next.</p>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
                    <div>
                      <p className="font-semibold text-white">Unable to sign in</p>
                      <p className="mt-1">{errorMessage || 'Invalid email or password.'}</p>
                    </div>
                  </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#E2E8F0]">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="karan@example.com"
                      className="w-full rounded-3xl border border-[#334155] bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20"
                    />
                    {email.length > 0 && !emailValid && (
                      <p className="text-xs text-rose-300">Enter a valid email address.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#E2E8F0]">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-3xl border border-[#334155] bg-[#111827] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-sm">
                    <label className="flex items-center gap-3 text-[#CBD5E1]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="h-4 w-4 rounded border-[#334155] bg-[#111827] text-[#10B981] focus:ring-[#10B981]"
                      />
                      Remember Me
                    </label>
                    <Link href="/forgot_password" className="font-semibold text-[#10B981] hover:text-[#34d399]">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${canSubmit
                      ? 'bg-[#10B981] text-[#020617] hover:bg-[#34d399]'
                      : 'cursor-not-allowed bg-[#334155] text-[#94A3B8]'
                      }`}
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <div className="flex items-center gap-4 text-xs uppercase tracking-[0.35em] text-[#94A3B8]">
                    <span className="h-px flex-1 bg-[#334155]" />
                    OR
                    <span className="h-px flex-1 bg-[#334155]" />
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#334155] bg-[#111827] px-4 py-3 text-sm font-semibold text-[#94A3B8] transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <SiGoogle className="h-4 w-4" />
                      Continue with Google
                    </button>
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#334155] bg-[#111827] px-4 py-3 text-sm font-semibold text-[#94A3B8] transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <SiGithub className="h-4 w-4" />
                      Continue with GitHub
                    </button>
                  </div>

                  <p className="text-center text-sm text-[#94A3B8]">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-semibold text-[#10B981] hover:text-[#34d399]">
                      Create Account
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}
