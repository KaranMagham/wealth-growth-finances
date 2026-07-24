import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import FAQ from '../../../components/FAQ'

const contactFaqs = [
  {
    question: 'How do I create an account?',
    answer: 'You can sign up in seconds using your email address and a secure password, then start organizing your finances immediately.',
  },
  {
    question: 'How secure is my data?',
    answer: 'We use secure authentication practices and modern data handling standards to keep your financial information protected.',
  },
  {
    question: 'Can I track investments?',
    answer: 'Yes. Wealth Growth lets you monitor investments, savings goals, and portfolio progress in one simple dashboard.',
  },
  {
    question: 'How do I report bugs?',
    answer: 'You can reach out through email or GitHub to report issues and help us improve the platform faster.',
  },
  {
    question: 'Can I request new features?',
    answer: 'Absolutely. Feature suggestions are always welcome and help shape future updates for Wealth Growth.',
  },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#10B981]/20 blur-[140px]" />

        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#1E293B]/80 px-3 py-2 text-sm font-medium text-[#F8FAFC] shadow-lg shadow-[#10B981]/10">
              <span className="text-[#D4AF37]">💬</span>
              <span>Help Center</span>
            </div>

            <h1 className="mt-7 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Need Help?
              <span className="mt-2 block text-[#10B981]">We&apos;re Here for You.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#CBD5E1]">
              Whether you have a question, found a bug, or want to suggest a new feature, we&apos;re always ready to help. Reach out to us and we&apos;ll get back to you as soon as possible.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="mailto:karanmagham09@gmail.com" className="rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#059669]">
                Contact Support
              </Link>
              <a href="#faq" className="rounded-full border border-[#10B981]/60 bg-[#0F172A]/70 px-6 py-3 text-sm font-semibold text-[#E2E8F0] transition hover:border-[#10B981] hover:bg-[#0F172A] hover:text-[#10B981]">
                View FAQs
              </a>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-[#334155] bg-[#0F172A]/80 p-8 shadow-[0_0_80px_rgba(16,185,129,0.12)]">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Contact Us</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Connect With Us Directly</h2>
              <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
                Send us your message and we&apos;ll respond within 24–48 hours. We value every suggestion, question, and feedback that helps improve Wealth Growth.
              </p>

              <form
                className="mt-8 space-y-4"
                action="mailto:karanmagham09@gmail.com"
                method="post"
                encType="text/plain"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <input name="name" className="rounded-2xl border border-[#334155] bg-[#111827] px-4 py-3 text-sm text-[#F8FAFC] outline-none ring-0 placeholder:text-[#64748B]" placeholder="Name" />
                  <input name="email" className="rounded-2xl border border-[#334155] bg-[#111827] px-4 py-3 text-sm text-[#F8FAFC] outline-none ring-0 placeholder:text-[#64748B]" placeholder="Email" />
                </div>
                <input name="subject" className="w-full rounded-2xl border border-[#334155] bg-[#111827] px-4 py-3 text-sm text-[#F8FAFC] outline-none ring-0 placeholder:text-[#64748B]" placeholder="Subject" />
                <textarea name="message" rows={5} className="w-full rounded-2xl border border-[#334155] bg-[#111827] px-4 py-3 text-sm text-[#F8FAFC] outline-none ring-0 placeholder:text-[#64748B]" placeholder="Message" />
                <button type="submit" className="rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#059669]">
                  Send Message
                </button>
              </form>
            </div>

            <div className="rounded-[32px] border border-[#334155] bg-gradient-to-br from-[#111827] to-[#172033] p-8 shadow-[0_0_80px_rgba(16,185,129,0.12)]">
              <div className="flex h-full flex-col justify-center rounded-[28px] border border-[#334155] bg-[#020617]/80 p-6">
                <div className="flex items-center justify-center rounded-3xl border border-[#334155] bg-[#111827] p-6 text-6xl">
                  💬
                </div>
                <div className="mt-6 rounded-[24px] border border-[#334155] bg-[#111827]/90 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">Contact Dashboard</p>
                  <p className="mt-3 text-2xl font-semibold text-white">We’re ready to help</p>
                  <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
                    Fast replies, helpful guidance, and updates that keep your financial workflow moving.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Other Ways to Reach Us</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Other Ways to Reach Us</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: '📧', title: 'Email Support', detail: 'karanmagham09@gmail.com', extra: 'Usually replies within 24–48 hours.' },
              { icon: '💻', title: 'GitHub', detail: 'Report bugs and follow project updates.', extra: 'Open issues and feature discussions.' },
              { icon: '💼', title: 'LinkedIn', detail: 'Connect professionally and ask project-related questions.', extra: 'Best for collaboration and networking.' },
              { icon: '💡', title: 'Suggestions', detail: 'Share ideas to improve Wealth Growth.', extra: 'We love hearing from users.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[#334155] bg-[#111827]/90 p-6 transition-all duration-300 hover:border-[#10B981] hover:shadow-[0_0_25px_rgba(16,185,129,0.16)]">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#CBD5E1]">{item.detail}</p>
                <p className="mt-2 text-sm text-[#94A3B8]">{item.extra}</p>
              </div>
            ))}
          </div>
        </section>

        <FAQ
          id="faq"
          subtitle="FAQ"
          title="Frequently Asked Questions"
          faqs={contactFaqs}
        />

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Our Commitment</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Our Commitment</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: '⏰', title: '24–48 Hours', detail: 'Average Response Time' },
              { icon: '😊', title: 'User Focused', detail: 'Every suggestion matters.' },
              { icon: '🚀', title: 'Continuous Updates', detail: 'Improving Wealth Growth every release.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[#334155] bg-[#111827]/90 p-6 text-center">
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">{item.detail}</p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-base leading-8 text-[#CBD5E1]">
            We strive to answer every message as quickly as possible because your feedback plays an important role in improving Wealth Growth.
          </p>
        </section>

        <Footer />
      </main>
    </>
  )
}
