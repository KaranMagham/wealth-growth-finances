"use client"

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Wallet,
  PiggyBank,
  LineChart,
  Bot,
  Zap,
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
    title: 'Track Every Expense',
    description: 'Automatically organize your income and spending in one place.',
  },
  {
    icon: PiggyBank,
    title: 'Create Smart Budgets',
    description: 'Plan monthly budgets and stay in control of your spending.',
  },
  {
    icon: LineChart,
    title: 'Monitor Investments',
    description: 'Follow stocks, mutual funds, and portfolio progress over time.',
  },
  {
    icon: Bot,
    title: 'Receive AI Financial Insights',
    description: 'Get personalized recommendations to grow wealth smarter.',
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

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }
}

function getPasswordStrength(password: string) {
  const checks = getPasswordChecks(password)
  const score = Object.values(checks).filter(Boolean).length

  if (!password || score <= 1) {
    return { label: 'Weak', filled: 1, color: 'bg-rose-500' }
  }
  if (score === 2) {
    return { label: 'Weak', filled: 2, color: 'bg-rose-500' }
  }
  if (score === 3) {
    return { label: 'Medium', filled: 3, color: 'bg-amber-400' }
  }
  return { label: 'Strong', filled: 5, color: 'bg-[#10B981]' }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password])
  const strength = useMemo(() => getPasswordStrength(password), [password])
  const passwordValid = Object.values(passwordChecks).every(Boolean)
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const emailValid = isValidEmail(email)
  const router = useRouter()

  useEffect(() => {
    const redirectIfAuthenticated = async () => {
      try {
        const res = await fetch('/api/auth/get-session', {
          method: 'GET',
          credentials: 'include',
        })

        if (!res.ok) {
          return
        }

        const data = await res.json().catch(() => null)
        const sessionUser = data?.user ?? data?.session?.user

        if (sessionUser?.email) {
          router.replace('/dashboard')
        }
      } catch {
        // Ignore and allow the page to render.
      }
    }

    redirectIfAuthenticated()
  }, [router])

  const canSubmit =
    fullName.trim().length > 1 &&
    emailValid &&
    passwordValid &&
    passwordsMatch &&
    acceptedTerms &&
    status !== 'loading'

  const requirementItems = [
    { key: 'length', label: '8 characters', met: passwordChecks.length },
    { key: 'uppercase', label: 'Uppercase', met: passwordChecks.uppercase },
    { key: 'number', label: 'Number', met: passwordChecks.number },
    { key: 'symbol', label: 'Symbol', met: passwordChecks.symbol },
  ] as const

  const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
      setStatus("loading")
      setErrorMessage("")

      const response = await fetch(`/api/auth/${provider}`, {
        method: "POST",
        credentials: "include",
      })
      const data = await response.json()

      if (!response.ok) {
        setStatus("error")
        setErrorMessage(data.message || `Unable to start ${provider} sign in right now.`)
        return
      }

      if (data?.url) {
        window.location.assign(data.url)
        return
      }

      setStatus("success")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch {
      setStatus("error")
      setErrorMessage("Unable to start social sign in right now.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setErrorMessage("Please accept the Terms & Conditions.");
      setStatus("error");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.message || "Signup failed");
        return;
      }

      // Better-Auth returns session in cookies automatically
      setStatus("success");

      setTimeout(() => {
        router.push("/login"); // or /dashboard
      }, 1500);
    } catch (error) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#10B981]/20 blur-[140px]" />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="space-y-8 lg:pt-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-2 text-sm font-semibold text-[#D4F2D3] shadow-[0_0_20px_rgba(16,185,129,0.08)]">
                <Sparkles className="h-4 w-4 text-[#10B981]" />
                Start Your Financial Journey
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  Create Your
                  <span className="block text-[#10B981]">Wealth Growth Account</span>
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[#CBD5E1] sm:text-lg">
                  Join thousands of users managing their finances smarter with one intelligent platform. Track expenses, manage budgets, monitor investments, and achieve your financial goals—all in one place.
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
              <div className="mx-auto w-full max-w-md rounded-[32px] border border-[#334155] bg-[#0F172A]/90 p-6 shadow-[0_0_50px_rgba(16,185,129,0.12)] sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Create Account</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Create your Wealth Growth account</h2>
                <p className="mt-4 text-sm leading-6 text-[#94A3B8]">
                  Start managing your finances securely in less than a minute.
                </p>

                {status === 'success' && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-3 text-sm text-[#D1FAE5]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
                    <div>
                      <p className="font-semibold text-white">Account Created</p>
                      <p className="mt-1 text-[#A7F3D0]">Next: verify your email, then complete your profile.</p>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
                    <div>
                      <p className="font-semibold text-white">Unable to create account</p>
                      <p className="mt-1">{errorMessage || 'Email already exists or network error.'}</p>
                    </div>
                  </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#E2E8F0]">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Karan Magham"
                      className="w-full rounded-3xl border border-[#334155] bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20"
                    />
                  </div>

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
                        placeholder="Create a password"
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

                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#94A3B8]">Password strength</span>
                        <span
                          className={
                            strength.label === 'Strong'
                              ? 'text-[#10B981]'
                              : strength.label === 'Medium'
                                ? 'text-amber-300'
                                : 'text-rose-300'
                          }
                        >
                          {password ? strength.label : '—'}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-1.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span
                            key={index}
                            className={`h-1.5 flex-1 rounded-full ${password && index < strength.filled ? strength.color : 'bg-[#334155]'
                              }`}
                          />
                        ))}
                      </div>
                    </div>

                    <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      {requirementItems.map((item) => (
                        <li
                          key={item.key}
                          className={`flex items-center gap-2 transition ${item.met ? 'text-[#10B981]' : 'text-[#64748B]'
                            }`}
                        >
                          <span>✓</span>
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-sm font-medium text-[#E2E8F0]">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirm your password"
                        className="w-full rounded-3xl border border-[#334155] bg-[#111827] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-white"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && (
                      <p className={`text-xs ${passwordsMatch ? 'text-[#10B981]' : 'text-rose-300'}`}>
                        {passwordsMatch ? '✓ Passwords Match' : 'Passwords do not match'}
                      </p>
                    )}
                  </div>

                  <label className="flex items-start gap-3 text-sm text-[#CBD5E1]">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#334155] bg-[#111827] text-[#10B981] focus:ring-[#10B981]"
                    />
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" className="text-[#10B981] hover:text-[#34d399]">
                        Terms & Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-[#10B981] hover:text-[#34d399]">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

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
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
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
                      onClick={() => handleSocialSignIn("google")}
                      className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#334155] bg-[#111827] px-4 py-3 text-sm font-semibold text-[#94A3B8] transition hover:border-[#10B981]/40 hover:text-white"
                    >
                      <SiGoogle className="h-4 w-4" />
                      Continue with Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialSignIn("github")}
                      className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#334155] bg-[#111827] px-4 py-3 text-sm font-semibold text-[#94A3B8] transition hover:border-[#10B981]/40 hover:text-white"
                    >
                      <SiGithub className="h-4 w-4" />
                      Continue with GitHub
                    </button>
                  </div>

                  <p className="text-center text-sm text-[#94A3B8]">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-[#10B981] hover:text-[#34d399]">
                      Log In
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
