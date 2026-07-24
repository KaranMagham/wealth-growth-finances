import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

const collectItems = [
  'Name',
  'Email Address',
  'Account Information',
  'Financial Records entered by the user',
  'Usage Analytics',
  'Device Information',
]

const usageItems = [
  'Manage your account',
  'Track financial records',
  'Improve application performance',
  'Provide customer support',
  'Send important account notifications',
]

const rightsItems = [
  'View your information',
  'Update your information',
  'Delete your account',
  'Contact us regarding privacy concerns',
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

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <main className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#10B981]/20 blur-[140px]" />

        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#1E293B]/80 px-3 py-2 text-sm font-medium text-[#F8FAFC] shadow-lg shadow-[#10B981]/10">
              <span className="text-[#D4AF37]">🔒</span>
              <span>Privacy Policy</span>
            </div>

            <h1 className="mt-7 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Your Privacy Matters
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#CBD5E1]">
              At Wealth Growth, protecting your personal and financial information is our priority. This Privacy Policy explains what information we collect, how we use it, and the steps we take to keep it secure.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/terms" className="rounded-full border border-[#10B981]/60 bg-[#0F172A]/70 px-6 py-3 text-sm font-semibold text-[#E2E8F0] transition hover:border-[#10B981] hover:bg-[#0F172A] hover:text-[#10B981]">
                View Terms
              </Link>
              <Link href="/contact" className="rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#059669]">
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-4xl space-y-5 px-4 pb-20 sm:px-6 lg:px-8">
          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              This Privacy Policy describes how Wealth Growth collects, stores, and protects user information when using our platform. By accessing our services, you agree to the practices described in this policy.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">2. Information We Collect</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              We may collect the following information to provide and improve our services.
            </p>
            <ul className="mt-5 space-y-3">
              {collectItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base leading-7 text-[#CBD5E1]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10B981]" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">3. How We Use Your Information</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              The information collected is used only to improve your experience and provide the core functionality of Wealth Growth.
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
            <h2 className="text-2xl font-semibold text-white">4. Data Protection</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              We use modern security practices to protect your personal information. Authentication, secure storage, and encrypted communication help keep your data safe from unauthorized access.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">5. Cookies</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              Wealth Growth may use cookies or similar technologies to improve user experience, remember preferences, and enhance application performance.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">6. Third-Party Services</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              Some services, such as authentication, analytics, or AI-powered features, may rely on trusted third-party providers. These services operate under their own privacy policies.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">7. Your Rights</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              As a user, you have the right to manage your personal information and request changes when applicable.
            </p>
            <ul className="mt-5 space-y-3">
              {rightsItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base leading-7 text-[#CBD5E1]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10B981]" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">8. Changes to This Privacy Policy</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              This Privacy Policy may be updated periodically. Any changes will be published on this page, and continued use of Wealth Growth indicates acceptance of the updated policy.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-7 shadow-[0_0_60px_rgba(16,185,129,0.08)] transition hover:border-[#10B981]/50">
            <h2 className="text-2xl font-semibold text-white">9. Contact Us</h2>
            <p className="mt-4 text-base leading-8 text-[#CBD5E1]">
              If you have any questions regarding this Privacy Policy or how your information is handled, please contact us.
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
