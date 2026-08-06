import Link from 'next/link'
import { Mail } from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import Image from 'next/image'

const Footer = () => {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-[#334155] bg-[#0B1220]/95 p-6 shadow-[0_0_80px_rgba(16,185,129,0.14)] sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[2.5fr_1fr_1fr_1fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#1E293B] p-1 shadow-lg shadow-[#10B981]/20">
                <Image
                  src="/logomain.png"
                  alt="Wealth Growth"
                  width={48}
                  height={48}
                  priority
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <p className="text-2xl font-semibold text-white">Wealth Growth</p>
            </div>

            <p className="max-w-md text-sm leading-7 text-[#CBD5E1]">
              Take control of your money with one intelligent platform for budgeting, investments, financial goals, and AI insights.
            </p>

            <div className="h-px w-full bg-[#334155] opacity-70" />

            <p className="text-sm leading-6 text-[#6B7280]">Helping you build better financial habits, one transaction at a time.</p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">
              Quick Links
            </p>
            <div className="mt-6 space-y-3 text-sm text-[#CBD5E1]">
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Login', href: '/login' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block transition duration-200 hover:text-[#10B981] hover:translate-x-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">
              Resources
            </p>
            <div className="mt-6 space-y-3 text-sm text-[#CBD5E1]">
              {[
                { label: 'Documentation', href: '/documentation' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block transition duration-200 hover:text-[#10B981] hover:translate-x-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">
              Connect
            </p>
            <div className="mt-6 space-y-3 text-sm text-[#CBD5E1]">
              <a href="mailto:karanmagham09@gmail.com" className="flex items-center gap-3 transition duration-200 hover:text-[#10B981] hover:translate-x-1">
                <Mail className="h-4 w-4" />
                Email
              </a>
              <a href="https://github.com/KaranMagham" target="_blank" rel="noreferrer" className="flex items-center gap-3 transition duration-200 hover:text-[#10B981] hover:translate-x-1">
                <SiGithub size={18} />
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/karan-magham-05b086357/" target="_blank" rel="noreferrer" className="flex items-center gap-3 transition duration-200 hover:text-[#10B981] hover:translate-x-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M19 0H5C2.238 0 0 2.238 0 5v14c0 2.762 2.238 5 5 5h14c2.762 0 5-2.238 5-5V5c0-2.762-2.238-5-5-5zM7.119 19H4.472V9h2.647v10zM5.796 7.713c-.849 0-1.53-.687-1.53-1.536 0-.85.68-1.536 1.53-1.536.85 0 1.531.686 1.531 1.536 0 .849-.681 1.536-1.531 1.536zM20.5 19h-2.647v-5.6c0-1.337-.026-3.057-1.863-3.057-1.864 0-2.15 1.457-2.15 2.963V19H10.2V9h2.544v1.36h.036c.354-.669 1.22-1.372 2.508-1.372 2.68 0 3.993 1.75 3.993 4.031V19z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#1F2937] pt-6 text-sm text-[#94A3B8] sm:flex-row sm:items-center">
          <div className="space-y-1">
            <p>© 2026 Wealth Growth. All rights reserved.</p>
            <p>Version 1.0.0</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition duration-200 hover:text-[#10B981] hover:translate-x-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="text-sm text-[#CBD5E1]">Crafted with ❤️ by Karan Magham</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
