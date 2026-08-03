"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, BadgeCheck, Briefcase, CreditCard, Landmark, Sparkles, Target, TrendingUp } from "lucide-react"
import Navbar from "../../../components/Navbar"
import Footer from "../../../components/Footer"
import { useSession } from "@/hooks/useSession"

const kpis = [
  { label: "Net Worth", value: "₹12,35,000", hint: "+8.2% vs last month" },
  { label: "Assets", value: "₹15,40,000", hint: "Cash, investments, property" },
  { label: "Liabilities", value: "₹3,05,000", hint: "Loans and credit cards" },
  { label: "Savings Rate", value: "32%", hint: "Healthy monthly pace" },
]

const summaryRows = [
  { label: "Income", value: "₹1,20,000", tone: "text-[#10B981]" },
  { label: "Expense", value: "₹81,000", tone: "text-rose-400" },
  { label: "Budget Used", value: "72%", tone: "text-amber-400" },
  { label: "Goal Progress", value: "82%", tone: "text-[#10B981]" },
]

const transactions = [
  { title: "Salary Deposit", meta: "Today • Income", amount: "+₹1,20,000", positive: true },
  { title: "Groceries", meta: "Yesterday • Essentials", amount: "-₹4,800", positive: false },
  { title: "EMI Payment", meta: "2 days ago • Loan", amount: "-₹12,500", positive: false },
  { title: "Investment Top-Up", meta: "3 days ago • Wealth", amount: "-₹20,000", positive: false },
  { title: "Freelance Income", meta: "5 days ago • Side Income", amount: "+₹18,000", positive: true },
]

export default function DashboardPage() {
  const { status, session } = useSession()
  const router = useRouter()

  const user = session?.user
  const displayName = user?.name || user?.email || "Investor"

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [router, status])

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

  if (status === "unauthenticated") {
    return null
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-[32px] border border-[#334155] bg-[#0F172A]/90 p-8 shadow-[0_0_50px_rgba(16,185,129,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-3 py-1 text-sm font-semibold text-[#D4F2D3]">
                    <Sparkles className="h-4 w-4 text-[#10B981]" />
                    Welcome back
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Welcome, {displayName}</h1>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[#94A3B8] sm:text-base">
                    Your financial health is in a strong position. Keep building momentum with steady habits and smart savings.
                  </p>
                </div>
                <div className="rounded-3xl border border-[#10B981]/30 bg-[#10B981]/10 px-5 py-4 text-right">
                  <p className="text-sm text-[#D4F2D3]">Financial Health</p>
                  <div className="mt-1 flex items-end justify-end gap-2">
                    <span className="text-4xl font-semibold text-white">84</span>
                    <span className="pb-1 text-sm text-[#10B981]">/ 100</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-1 text-sm font-semibold text-[#10B981]">
                    <BadgeCheck className="h-4 w-4" />
                    Good
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-[#1F2937] bg-[#111827]/80 p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[#94A3B8]">Net Worth</p>
                    <p className="mt-2 text-4xl font-semibold text-white">₹12,35,000</p>
                  </div>
                  <div className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-sm font-semibold text-[#10B981]">
                    +8.2% this month
                  </div>
                </div>
              </div>
            </section>

            <aside className="rounded-[32px] border border-[#334155] bg-[#0F172A]/90 p-6 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 p-3 text-[#10B981]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Quick insight</h2>
                  <p className="text-sm text-[#94A3B8]">Your savings rate improved by 8% this month.</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#E2E8F0]">
                    <Target className="h-4 w-4 text-[#10B981]" />
                    Emergency Fund
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">82%</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">You are close to your target.</p>
                </div>
                <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#E2E8F0]">
                    <Briefcase className="h-4 w-4 text-[#10B981]" />
                    Debt Ratio
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">19.7%</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">Still manageable and improving.</p>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {summaryRows.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-4">
                    <p className="text-sm text-[#94A3B8]">{item.label}</p>
                    <p className={`mt-2 text-xl font-semibold ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#94A3B8]">
                <Landmark className="h-4 w-4 text-[#10B981]" />
                Financial Health
              </div>
              <div className="mt-5 rounded-2xl border border-[#1F2937] bg-[#111827]/70 p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#94A3B8]">Score</p>
                    <p className="mt-1 text-3xl font-semibold text-white">84/100</p>
                  </div>
                  <div className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-sm font-semibold text-[#10B981]">
                    Good
                  </div>
                </div>
                <div className="mt-5 h-3 rounded-full bg-[#1F2937]">
                  <div className="h-3 w-[84%] rounded-full bg-[#10B981]" />
                </div>
                <p className="mt-3 text-sm text-[#94A3B8]">Balanced spending, healthy savings, and improving net worth.</p>
              </div>
            </div>
          </div>

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
              {transactions.map((item) => (
                <div key={item.title} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1F2937] bg-[#111827]/70 px-4 py-4">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-[#94A3B8]">{item.meta}</p>
                  </div>
                  <div className={`text-sm font-semibold ${item.positive ? "text-[#10B981]" : "text-rose-400"}`}>
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <Footer />
      </main>
    </>
  )
}
