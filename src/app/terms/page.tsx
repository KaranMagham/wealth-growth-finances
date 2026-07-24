import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

const eligibilityItems = [
  'You must provide accurate account information',
  'You are responsible for keeping your login credentials secure',
  'You agree to use Wealth Growth only for lawful purposes',
]

const usageItems = [
  'Track expenses and manage budgets',
  'Monitor investments and financial goals',
  'Access AI insights and platform features',
  'Use support and documentation resources',
]

const restrictionItems = [
  'Attempting to access accounts that do not belong to you',
  'Misusing the platform or disrupting service availability',
  'Uploading harmful, illegal, or unauthorized content',
  'Copying, reverse engineering, or redistributing platform features without permission',
]

const contactLinks = [
  {
    label: 'Email',
    value: 'karanmagham09@gmail.com',
    href: 'mailto:karanmagham09@gmail.com',
    icon: '📧',
  },
  {
    label: 'GitHub',
    value: 'github.com/KaranMagham',
    href: 'https://github.com/KaranMagham',
    icon: '💻',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/karan-magham-05b086357',
    href: 'https://linkedin.com/in/karan-magham-05b086357',
    icon: '💼',
  },
]

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <main className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#10B981]/20 blur-[140px]" />

        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#1E293B]/80 px-3 py-2 text-sm font-medium text-[#F8FAFC] shadow-lg shadow-[#10B981]/10">
              <span className="text-[#D4AF37]">📜</span>
              <span>Terms & Conditions</span>
            </div>

            <h1 className="mt-7 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Terms of Service
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#CBD5E1]">
              These Terms & Conditions outline the rules and guidelines for using Wealth Growth. By creating an account or accessing the platform, you agree to these terms.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/privacy" className="rounded-full border border-[#10B981]/60 bg-[#0F172A]/70 px-6 py-3 text-sm font-semibold text-[#E2E8F0] transition hover:border-[#10B981] hover:bg-[#0F172A] hover:text-[#10B981]">
                View Privacy Policy
              </Link>
              <Link href="/contact " className="rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#059669]">
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-4xl space-y-5 px-4 pb-20 sm:px-6 lg:px-8">
          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              Welcome to Wealth Growth. These Terms & Conditions govern your use of our platform, including budgeting tools, investment tracking, financial insights, and related services. Please read them carefully before using the application.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">2. Eligibility</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              To use Wealth Growth, you must meet the following requirements.
            </p>
            <ul className="mt-5 space-y-3">
              {eligibilityItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base leading-7 text-[#CBD5E1]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10B981]" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">3. Use of Services</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              Wealth Growth provides tools to help you manage personal finances. You may use the platform to:
            </p>
            <ul className="mt-5 space-y-3">
              {usageItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base leading-7 text-[#CBD5E1]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10B981]" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">4. User Responsibilities</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              You are responsible for the accuracy of the information you enter and for all activity that occurs under your account. Wealth Growth is a management tool and does not provide guaranteed financial outcomes.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">5. Restrictions</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              To keep the platform safe and reliable, the following activities are not allowed:
            </p>
            <ul className="mt-5 space-y-3">
              {restrictionItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base leading-7 text-[#CBD5E1]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10B981]" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">6. Intellectual Property</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              All content, branding, design, and software related to Wealth Growth remain the property of the platform owners. You may not reuse or redistribute these assets without prior permission.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">7. Limitation of Liability</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              Wealth Growth is provided as a financial management platform. We are not liable for decisions made based on insights, tracking data, or recommendations shown in the application. Always use your own judgment for financial choices.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">8. Changes to These Terms</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              These Terms & Conditions may be updated from time to time. Updated versions will be published on this page, and continued use of Wealth Growth means you accept the revised terms.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">9. Contact Us</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              If you have questions about these Terms & Conditions, feel free to reach out.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {contactLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="rounded-2xl border border-[#334155] bg-[#0F172A]/80 p-4 transition hover:border-[#10B981] hover:bg-[#0F172A]"
                >
                  <p className="text-sm text-[#94A3B8]">
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-white">{item.value}</p>
                </Link>
              ))}
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </>
  )
}
