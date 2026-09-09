import Link from "next/link";
import {
  Bell,
  BrainCircuit,
  ChartNoAxesCombined,
  CheckCircle2,
  Goal,
  LockKeyhole,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

const capabilities = [
  {
    title: "One financial overview",
    description: "See cash balance, savings, net worth, budgets, goals, investments, and recent activity together on the dashboard.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Transactions that stay useful",
    description: "Record income and expenses, review recent activity, and understand the flow behind your financial decisions.",
    icon: ReceiptText,
  },
  {
    title: "Budgets with clear progress",
    description: "Set category limits and follow spending progress before small changes become surprises.",
    icon: WalletCards,
  },
  {
    title: "Goals with contribution history",
    description: "Create financial goals, add contributions, and keep a dated record of every step toward the target.",
    icon: Goal,
  },
  {
    title: "Investment tracking",
    description: "Track investments, valuation, profit and loss, asset mix, and current portfolio performance in one place.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Insights and assistance",
    description: "Use financial analysis, reports, and the AI Wealth Assistant to turn your recorded data into practical context.",
    icon: BrainCircuit,
  },
  {
    title: "Notifications that matter",
    description: "Receive in-app updates for relevant milestones, summaries, alerts, and other activity, with read state under your control.",
    icon: Bell,
  },
  {
    title: "Private by account",
    description: "Authentication, session checks, and user-scoped data access keep your financial workspace separate from everyone else’s.",
    icon: LockKeyhole,
  },
];

const faqs = [
  {
    question: "What can I manage in Wealth Growth?",
    answer: "You can manage transactions, budgets, goals, contributions, investments, notifications, and financial analysis from the same account.",
  },
  {
    question: "Can I use Wealth Growth on my phone?",
    answer: "Yes. The dashboard and core workflows are responsive and designed for desktop, tablet, and mobile screens.",
  },
  {
    question: "Does Wealth Growth support social sign-in?",
    answer: "Yes. Email and password authentication are supported alongside Google and GitHub sign-in when configured for the application.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)] text-white">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/35 bg-[#10B981]/10 px-3 py-1.5 text-sm font-semibold text-[#D4F2D3]">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              A clearer view of your money
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-6xl">
              Wealth Growth brings your financial life into focus.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#CBD5E1]">
              Wealth Growth is a personal finance workspace for organizing day-to-day money decisions and building toward long-term goals. It keeps the numbers, progress, and context you need close at hand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-xl bg-[#10B981] px-5 py-3 text-sm font-semibold text-[#022C22] transition hover:bg-[#34D399]">
                Create your account
              </Link>
              <Link href="/dashboard" className="rounded-xl border border-[#334155] bg-[#0F172A]/80 px-5 py-3 text-sm font-semibold text-[#E2E8F0] transition hover:border-[#10B981] hover:text-[#6EE7B7]">
                Explore the dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#10B981]">What is here today</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Tools that work together</h2>
            <p className="mt-4 leading-7 text-[#94A3B8]">Each part of Wealth Growth feeds a more useful picture of your financial health, without asking you to maintain separate systems.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-3xl border border-[#334155] bg-[#0F172A]/90 p-5 transition hover:-translate-y-1 hover:border-[#10B981]/60">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#10B981]"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid gap-6 rounded-3xl border border-[#334155] bg-[#111827]/80 p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#10B981]">Built around trust</p>
              <h2 className="mt-3 text-3xl font-semibold">Your account stays yours.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-[#CBD5E1]">Wealth Growth uses authenticated sessions and user-scoped access across financial records. Google and GitHub profile data can be used for sign-in and account personalization, while email and password accounts have the same core workspace.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-[#334155] bg-[#0F172A] p-4"><p className="font-semibold text-white">Authenticated workspace</p><p className="mt-1 text-sm text-[#94A3B8]">Your dashboard, goals, budgets, and records are tied to your account.</p></div>
              <div className="rounded-2xl border border-[#334155] bg-[#0F172A] p-4"><p className="font-semibold text-white">Actionable context</p><p className="mt-1 text-sm text-[#94A3B8]">Reports and assistant responses use the financial information you choose to record.</p></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <h2 className="text-3xl font-semibold">Frequently asked</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-[#334155] bg-[#0F172A]/80 p-5">
                <summary className="cursor-pointer list-none font-semibold text-white">{faq.question}</summary>
                <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
