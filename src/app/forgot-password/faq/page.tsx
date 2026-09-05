import Link from 'next/link'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'
import FAQ from '../../../../components/FAQ'

const faqItems = [
  {
    question: 'What is Wealth Growth?',
    answer: 'Wealth Growth helps you manage expenses, budgets, investments, and financial goals from one platform.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use secure authentication and modern security practices to protect your information.',
  },
  {
    question: 'Can I track my investments?',
    answer: 'Yes. Wealth Growth lets you monitor investments, savings goals, and portfolio progress in one simple dashboard.',
  },
  {
    question: 'How do I request new features?',
    answer: 'Absolutely. Feature suggestions are always welcome and help shape future updates for Wealth Growth.',
  },
  {
    question: 'How do I contact?',
    answer: 'You can reach out through email or the contact page to report issues and ask questions.',
  },
]

export default function FAQPage() {
  return (
    <>
      <Navbar />

      <main className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#10B981]/20 blur-[140px]" />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">FAQ</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Frequently Asked Questions</h1>
            <p className="mt-6 text-base leading-7 text-[#CBD5E1]">
              Find answers to the most common questions about Wealth Growth and how to get started.
            </p>
          </div>
        </section>

        <FAQ
          id="faq"
          subtitle="Help Center"
          title="Common Contact Questions"
          faqs={faqItems}
        />

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/contact" className="inline-flex rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-[#020617] transition hover:bg-[#34d399]">
              Back to Contact
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
