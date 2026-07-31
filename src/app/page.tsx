import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FAQ from "../../components/FAQ";
import Image from "next/image";

const trustItems = ["Secure", "AI Powered", "Investment Tracking", "Smart Reports"];

const homeFaqs = [
  {
    question: "What is the Wealth Growth platform?",
    answer:
      "Wealth Growth is a modern finance hub for tracking spending, budgeting, investing, and staying on top of your financial goals.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use secure authentication, encryption, and trusted privacy practices to keep your financial information safe.",
  },
  {
    question: "Can I track my investments?",
    answer:
      "Absolutely — add investment accounts and watch performance, allocation, and progress in one place.",
  },
  {
    question: "How is Wealth Growth different from other finance apps?",
    answer:
      "Wealth Growth brings expense tracking, budgeting, investments, financial goals, reports, and AI-powered insights together in one simple and modern platform.",
  },
  {
    question: "Is Wealth Growth free to use?",
    answer:
      "Yes. Our core financial management features are free to use, with more advanced features planned for future updates.",
  },
];

const handleLogout = async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login";
};

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      <main className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[#10B981]/20 blur-[120px]" />

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

            {/* <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 text-center text-sm text-[#CBD5E1] sm:grid-cols-3">
              <div className="rounded-3xl border border-[#334155] bg-[#0F172A]/70 px-4 py-4">
                <p className="text-2xl font-semibold text-white">15K+</p>
                <p className="mt-1">Transactions Tracked</p>
              </div>
              <div className="rounded-3xl border border-[#334155] bg-[#0F172A]/70 px-4 py-4">
                <p className="text-2xl font-semibold text-white">4K+</p>
                <p className="mt-1">Goals Completed</p>
              </div>
              <div className="rounded-3xl border border-[#334155] bg-[#0F172A]/70 px-4 py-4">
                <p className="text-2xl font-semibold text-white">99%</p>
                <p className="mt-1">Secure</p>
              </div>
            </div>  */}

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

          <div>
            <Image
              src="/logomain.png"
              alt="Wealth Growth"
              width={380}
              height={380}
              priority
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">
              Features
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              What makes Wealth Growth stand out
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: "📊",
                title: "Expense Tracking",
                detail: "Organize transactions automatically and see your spending patterns clearly.",
                label: "Track Spending →",
              },
              {
                icon: "🎯",
                title: "Budget Management",
                detail: "Build custom budgets, set alerts, and keep your cash flow aligned with your goals.",
                label: "Plan Smarter →",
              },
              {
                icon: "🤖",
                title: "AI Insights",
                detail: "Receive recommendations that are personalized for your money habits and goals.",
                label: "Explore Insights →",
              },
              {
                icon: "📈",
                title: "Investment Tracking",
                detail:
                  "Monitor your stocks, mutual funds, and other investments in one organized portfolio.",
                label: "View Portfolio →",
              },
              {
                icon: "🏆",
                title: "Financial Goals",
                detail:
                  "Set savings goals, track your progress, and stay motivated with milestone updates.",
                label: "Reach Your Goals →",
              },
              {
                icon: "📑",
                title: "Analytics & Reports",
                detail:
                  "Understand your finances through interactive charts, spending reports, and financial summaries.",
                label: "View Reports →",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-6 transition-all duration-300 hover:border-[#10B981] hover:bg-[#0F172A]/90 hover:shadow-[0_0_25px_rgba(16,185,129,0.18)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#10B981]/10 text-3xl">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#CBD5E1]">{feature.detail}</p>
                <Link
                  href="/features"
                  className="mt-5 inline-flex items-center text-sm font-semibold text-[#10B981] transition hover:text-[#34d399]"
                >
                  {feature.label}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">
              How It Works
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Manage your finances in three simple steps
            </h2>
          </div>

          <div className="space-y-16">
            {[
              {
                step: "01",
                title: "Track Everything in One Place",
                description:
                  "Bring your income, spending, and cash flow together in one clear view so you always know where your money is going.",
                bullets: ["Add income & expenses", "Automatic categorization", "Track cash flow"],
                imageLabel: "Dashboard Screenshot",
              },
              {
                step: "02",
                title: "Plan Your Monthly Budget",
                description:
                  "Create budgets that fit your goals, stay on top of spending, and make better decisions with less effort.",
                bullets: ["Monthly budgets", "Spending alerts", "Goal tracking"],
                imageLabel: "Budget Screenshot",
              },
              {
                step: "03",
                title: "Grow with AI Insights",
                description:
                  "Use smart insights, wealth tracking, and detailed reports to understand your progress and make stronger choices.",
                bullets: ["AI insights", "Wealth score", "Actionable reports"],
                imageLabel: "Analytics Screenshot",
              },
            ].map((item, index) => {
              const isReversed = index % 2 === 1;

              return (
                <div
                  key={item.step}
                  className="relative grid items-center gap-10 overflow-hidden rounded-[36px] border border-[#334155] bg-[#0F172A]/80 px-6 py-10 lg:grid-cols-2 lg:px-10 lg:py-14"
                >
                  <div className={`absolute -top-8 ${index === 0 ? "left-4" : index === 1 ? "right-4" : "left-4"} text-[180px] font-black text-white/5 sm:text-[220px]`}>
                    {item.step}
                  </div>

                  <div className={isReversed ? "lg:order-2" : ""}>
                    <div className="relative z-10 flex h-[320px] items-center justify-center rounded-[28px] border border-[#334155] bg-[#111827] text-center hover:scale-[1.02] hover:border-[#10B981] hover:bg-[#0F172A]/90 hover:shadow-[0_0_40px_rgba(16,185,129,0.12)] transition">
                      <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-[#10B981]/80">Image Placeholder</p>
                        <p className="mt-4 text-2xl font-semibold text-white">{item.imageLabel}</p>
                        <p className="mt-2 text-sm text-[#94A3B8]">1000 × 700</p>
                      </div>
                    </div>
                  </div>

                  <div className={isReversed ? "lg:order-1 lg:pr-8" : "lg:pl-2"}>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                      Step {item.step}
                    </p>
                    <h3 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                      {item.title}
                    </h3>
                    <p className="mt-5 max-w-xl text-base leading-8 text-[#CBD5E1]">
                      {item.description}
                    </p>
                    <ul className="mt-8 space-y-3 text-base text-[#94A3B8]">
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-3">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <FAQ
          id="faq"
          subtitle="FAQ"
          title="Your questions answered"
          faqs={homeFaqs}
        />

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[36px] border border-[#334155] bg-[#111827]/95 px-6 py-14 shadow-[0_0_140px_rgba(16,185,129,0.18)] sm:px-10">
            <div className="pointer-events-none absolute right-6 top-8 h-40 w-40 rounded-full bg-[#10B981]/15 blur-3xl" />
            <div className="pointer-events-none absolute left-6 bottom-8 h-28 w-28 rounded-full bg-[#34d399]/15 blur-3xl" />

            <div className="relative mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">
                Ready to start?
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Ready to Start Your
                <span className="block text-[#10B981]">Financial Journey?</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#CBD5E1]">
                Join Wealth Growth today and take control of your money with one intelligent finance platform.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-full bg-[#10B981] px-10 py-4 text-base font-semibold text-[#020617] transition hover:bg-[#34d399]"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
