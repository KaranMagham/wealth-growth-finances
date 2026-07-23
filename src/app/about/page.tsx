import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import Image from 'next/image'

const whyChooseItems = [
  {
    title: 'Secure Authentication',
    description: 'Your financial information is protected using secure authentication and modern security practices.',
  },
  {
    title: 'Modern User Interface',
    description: 'A clean and responsive interface designed to make financial management simple and enjoyable.',
  },
  {
    title: 'Smart Analytics',
    description: 'Understand your financial performance with meaningful statistics and visual reports.',
  },
  {
    title: 'AI Assistance',
    description: 'Personalized recommendations help you make smarter financial decisions.',
  },
  {
    title: 'Responsive Design',
    description: 'Access your financial information seamlessly across desktop, tablet, and mobile devices.',
  },
  {
    title: 'Future Ready',
    description: 'Built with scalable technologies to support future features and continuous improvements.',
  },
]

const techStacks = [
  { name: 'Next.js', accent: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400/70 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.16)]' },
  { name: 'TypeScript', accent: 'border-sky-400/30 bg-sky-500/10 text-sky-200 hover:border-sky-400/70 hover:bg-sky-500/20 hover:shadow-[0_0_20px_rgba(56,189,248,0.16)]' },
  { name: 'Tailwind CSS', accent: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:border-cyan-400/70 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.16)]' },
  { name: 'Node.js', accent: 'border-lime-400/30 bg-lime-500/10 text-lime-200 hover:border-lime-400/70 hover:bg-lime-500/20 hover:shadow-[0_0_20px_rgba(132,204,22,0.16)]' },
  { name: 'Express.js', accent: 'border-violet-400/30 bg-violet-500/10 text-violet-200 hover:border-violet-400/70 hover:bg-violet-500/20 hover:shadow-[0_0_20px_rgba(167,139,250,0.16)]' },
  { name: 'MongoDB', accent: 'border-amber-400/30 bg-amber-500/10 text-amber-200 hover:border-amber-400/70 hover:bg-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.16)]' },
  { name: 'JWT Authentication', accent: 'border-rose-400/30 bg-rose-500/10 text-rose-200 hover:border-rose-400/70 hover:bg-rose-500/20 hover:shadow-[0_0_20px_rgba(251,113,133,0.16)]' },
  { name: 'AI Integration', accent: 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200 hover:border-fuchsia-400/70 hover:bg-fuchsia-500/20 hover:shadow-[0_0_20px_rgba(232,121,249,0.16)]' },
]

const roadmapItems = [
  'Authentication',
  'Dashboard',
  'Budget Management',
  'Investment Tracking',
  'Analytics',
  'AI Wealth Assistant',
  'Notifications',
  'Mobile Application',
]

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[#10B981]/20 blur-[120px]" />

        <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-24">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#1E293B]/80 px-3 py-2 text-sm font-medium text-[#F8FAFC] shadow-lg shadow-[#10B981]/10">
              <span className="text-[#D4AF37]">✨</span>
              <span>About Wealth Growth</span>
            </div>

            <h1 className="mt-7 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Building Smarter Financial Habits,
              <span className="mt-2 block text-[#10B981]">One Decision at a Time.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#CBD5E1] lg:mx-0">
              Wealth Growth is a modern financial management platform designed to help individuals organize their finances, monitor investments, create budgets, and achieve long-term financial goals. Our mission is to simplify money management through an intuitive, secure, and intelligent experience.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link href="/login" className="rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#059669]">
                Get Started
              </Link>
              <Link href="/support" className="rounded-full border border-[#10B981]/60 bg-[#0F172A]/70 px-6 py-3 text-sm font-semibold text-[#E2E8F0] transition hover:border-[#10B981] hover:bg-[#0F172A] hover:text-[#10B981]">
                Contact Us
              </Link>
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

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Our Story</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Why We Built Wealth Growth</h2>
            <p className="mt-5 text-lg leading-8 text-[#CBD5E1]">
              Managing personal finances often requires using multiple applications for budgeting, expense tracking, investments, and financial planning. This scattered approach makes it difficult to gain a complete understanding of one&apos;s financial health.
            </p>
            <p className="mt-4 text-lg leading-8 text-[#CBD5E1]">
              Wealth Growth was created to solve this problem by bringing every essential financial tool together in one modern platform. Instead of switching between different applications, users can monitor their income, expenses, investments, goals, and overall financial progress from a single dashboard.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-[#334155] bg-[#0F172A]/80 p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Our Mission</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Our Mission</h2>
            <p className="mt-5 max-w text-lg leading-8 text-[#CBD5E1]">
              Our mission is to make personal finance simple, accessible, and intelligent for everyone. By combining powerful financial tools with modern technology, Wealth Growth helps users build better financial habits, make informed decisions, and confidently work toward long-term financial success.
            </p>
          </div>
        </section>

        {/* <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">What We Offer</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Everything You Need to Manage Your Money</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {offerings.map((item) => (
              <div key={item.title} className="rounded-[28px] border border-[#334155] bg-[#111827]/90 p-6 transition hover:-translate-y-1 hover:border-[#10B981] hover:bg-[#0F172A]/90">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]/10 text-2xl">✦</div>
                <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#CBD5E1]">{item.description}</p>
              </div>
            ))}
          </div>
        </section> */}

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Why Choose Wealth Growth</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Why Choose Wealth Growth?</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {whyChooseItems.map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[#334155] bg-[#111827]/90 p-6 transaction hover:-translate-y-1 hover:border-[#10B981] hover:bg-[#0F172A]/90">
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#CBD5E1]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-[#334155] bg-[#0F172A]/80 p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Vision</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Our Vision</h2>
            <p className="mt-5 max-w-4xl text-lg leading-8 text-[#CBD5E1]">
              We envision Wealth Growth becoming a complete digital financial companion that empowers users to confidently manage their money, grow their wealth, and achieve financial independence through technology-driven solutions.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Technology Stack</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Built with Modern Technologies</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#CBD5E1]">
              Wealth Growth is developed using modern web technologies to deliver a fast, secure, and scalable experience.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {techStacks.map((item) => (
              <span
                key={item.name}
                className={`rounded-full border border-[#334155] bg-[#111827]/90 px-4 py-2 text-sm font-medium text-[#E2E8F0] transition-all duration-300 hover:-translate-y-0.5 ${item.accent}`}
              >
                {item.name}
              </span>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Development Roadmap</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Project Roadmap</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roadmapItems.map((item, index) => {
              const completed = index < 5
              return (
                <div key={item} className="rounded-[24px] border border-[#334155] bg-[#111827]/90 p-5">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-3 w-3 rounded-full ${completed ? 'bg-[#10B981]' : 'bg-[#D4AF37]'}`} />
                    <span className="text-sm font-semibold text-[#F8FAFC]">{item}</span>
                  </div>
                  <p className="mt-3 text-sm text-[#94A3B8]">{completed ? 'Completed' : 'Planned'}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-[#334155] bg-[#0F172A]/80 p-8 sm:p-10 lg:flex lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">Meet the Developer</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Meet the Developer</h2>
              <p className="mt-5 text-lg leading-8 text-[#CBD5E1]">
                Hi, I&apos;m Karan Magham, a third-year Computer Science student at the University of Mumbai. Wealth Growth is my academic project created with the vision of simplifying personal finance through technology. This project reflects my passion for software development, user experience, and financial technology.
              </p>
            </div>

            <div className="mt-8 flex gap-3 lg:mt-0">
              <Link href="https://github.com/KaranMagham" className="rounded-full border border-[#10B981]/50 bg-[#10B981]/10 px-5 py-3 text-sm font-semibold text-[#10B981] transition hover:bg-[#10B981]/20">
                GitHub
              </Link>
              <Link href="https://www.linkedin.com/in/karan-magham-05b086357/" className="rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-5 py-3 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/20">
                LinkedIn
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[36px] border border-[#334155] bg-[#111827]/95 px-6 py-14 shadow-[0_0_140px_rgba(16,185,129,0.18)] sm:px-10">
            <div className="pointer-events-none absolute right-6 top-8 h-40 w-40 rounded-full bg-[#10B981]/15 blur-3xl" />
            <div className="pointer-events-none absolute left-6 bottom-8 h-28 w-28 rounded-full bg-[#34d399]/15 blur-3xl" />

            <div className="relative mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">CTA</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Ready to Take Control
                <span className="block text-[#10B981]">of Your Finances?</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#CBD5E1]">
                Join Wealth Growth today and begin your journey toward smarter financial management with one intelligent platform.
              </p>

              <div className="mt-10 flex justify-center">
                <Link href="/login" className="rounded-full bg-[#10B981] px-10 py-4 text-base font-semibold text-[#020617] transition hover:bg-[#34d399]">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
