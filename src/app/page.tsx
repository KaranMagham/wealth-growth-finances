import Link from "next/link";
import Navbar from "../../components/Navbar";

const trustItems = ["Secure", "AI Powered", "Investment Tracking", "Smart Reports"];

export default function Home() {
  return (
    <>
    {/* Navbar */}
      <Navbar />

      <main className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)]">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[#10B981]/20 blur-[120px]" />

        <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-14 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-20">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#1E293B]/80 px-3 py-2 text-sm font-medium text-[#F8FAFC] shadow-lg shadow-[#10B981]/10">
              <span className="text-[#D4AF37]">✨</span>
              <span>Personal Finance Made Simple</span>
            </div>

            <h1 className="mt-7 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              <span className="block">Take Control of</span>
              <span className="mt-2 block text-[#10B981]">Your Financial Future</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#CBD5E1] lg:mx-0">
              Track expenses, manage budgets, monitor investments, and gain AI-powered
              insights—all from one intelligent platform.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                href="/login"
                className="rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#059669]"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-[#10B981]/60 bg-[#0F172A]/70 px-6 py-3 text-sm font-semibold text-[#E2E8F0] transition hover:border-[#10B981] hover:bg-[#0F172A] hover:text-[#10B981]"
              >
                Learn More
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-[#94A3B8] lg:justify-start">
              {trustItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#1E293B]/70 px-3 py-2"
                >
                  <span className="text-[#10B981]">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative w-full max-w-[560px]">
            <div className="absolute -left-2 top-10 hidden rounded-2xl border border-[#334155] bg-[#0F172A]/90 px-4 py-3 shadow-[0_0_40px_rgba(16,185,129,0.12)] lg:block">
              <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">Savings</p>
              <p className="mt-1 text-2xl font-semibold text-white">+₹12,500</p>
              <p className="text-sm text-[#94A3B8]">Monthly Savings</p>
            </div>

            <div className="absolute -right-2 top-24 hidden rounded-2xl border border-[#334155] bg-[#0F172A]/90 px-4 py-3 shadow-[0_0_40px_rgba(16,185,129,0.12)] lg:block">
              <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">Wealth</p>
              <p className="mt-1 text-2xl font-semibold text-white">87/100</p>
              <p className="text-sm text-[#94A3B8]">Wealth Score</p>
            </div>

            <div className="absolute bottom-4 left-[20%] hidden rounded-2xl border border-[#334155] bg-[#0F172A]/90 px-4 py-3 shadow-[0_0_40px_rgba(16,185,129,0.12)] lg:block">
              <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">Budget</p>
              <p className="mt-1 text-2xl font-semibold text-white">72% Used</p>
              <p className="text-sm text-[#94A3B8]">Monthly Budget</p>
            </div>

            <div className="rounded-[32px] border border-[#334155] bg-[#0F172A]/70 p-3 shadow-[0_0_90px_rgba(16,185,129,0.16)]">
              <div className="rounded-[24px] border border-[#334155] bg-[#020617] p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between rounded-full border border-[#334155] bg-[#111827] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                    <span className="text-sm text-[#E2E8F0]">Dashboard</span>
                  </div>
                  <span className="rounded-full bg-[#10B981]/15 px-3 py-1 text-xs font-semibold text-[#10B981]">
                    Live
                  </span>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-2xl border border-[#334155] bg-[#111827] p-4">
                    <div className="flex items-center justify-between text-sm text-[#94A3B8]">
                      <span>Net Worth</span>
                      <span className="font-semibold text-[#10B981]">+18.4%</span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-[#1E293B]">
                      <div className="h-3 w-[72%] rounded-full bg-gradient-to-r from-[#10B981] to-[#34d399]" />
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#334155] bg-[#0F172A] p-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">Assets</p>
                        <p className="mt-2 text-xl font-semibold text-white">₹4.8L</p>
                      </div>
                      <div className="rounded-xl border border-[#334155] bg-[#0F172A] p-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">Liabilities</p>
                        <p className="mt-2 text-xl font-semibold text-white">₹1.2L</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-[#334155] bg-[#111827] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#94A3B8]">Budget</span>
                        <span className="text-sm font-semibold text-[#10B981]">72%</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-[#1E293B]">
                        <div className="h-2 w-[72%] rounded-full bg-[#10B981]" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[#334155] bg-[#111827] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#94A3B8]">AI Insights</span>
                        <span className="text-sm font-semibold text-[#D4AF37]">+12%</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#CBD5E1]">
                        Your savings plan is trending ahead of target this month.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
