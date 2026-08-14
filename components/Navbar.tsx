"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { Plus } from "lucide-react";

const Navbar = () => {
  const { status, session } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname();

  const showAddTransaction = pathname !== "/transactions";
  const user = session?.user
  const isAuthenticated = status === 'authenticated' && !!user
  const isLoading = status === 'loading'

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' })
    } finally {
      setIsMenuOpen(false)
      router.push('/login')
    }
  }

  const mobileLinks = isAuthenticated
    ? [
      { href: '/', label: 'Home' },
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/transactions', label: 'Transactions' },
      { href: '/features', label: 'Assets' },
      { href: '/about', label: 'Goals' },
      { href: '/contact', label: 'Help Center' },
    ]
    : [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Help Center' },
    ]

  return (
    <header className="sticky top-0 z-50 border-b border-[#334155] bg-[#0F172A]/90 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
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
          <span className="text-lg font-extrabold tracking-wide text-[#F8FAFC]">
            Wealth Growth
          </span>
        </Link>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#10B981]/30 bg-[#111827]/80 text-[#D4F2D3] lg:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#E2E8F0] lg:flex">
          <Link
            href="/about"
            className="group relative transition duration-300 ease-out hover:-translate-y-0.5 hover:text-[#10B981]"
          >
            <span className="absolute bottom-[-4px] left-0 h-0.5 w-0 rounded-full bg-[#10B981] transition-all duration-300 ease-out group-hover:w-full" />
            About
          </Link>
          <Link
            href="/contact"
            className="group relative transition duration-300 ease-out hover:-translate-y-0.5 hover:text-[#10B981]"
          >
            <span className="absolute bottom-[-4px] left-0 h-0.5 w-0 rounded-full bg-[#10B981] transition-all duration-300 ease-out group-hover:w-full" />
            Help Center
          </Link>
          <span className="text-[#334155]">|</span>
          {isLoading ? null : isAuthenticated ? (
            <>
              <span className="hidden rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 text-sm text-[#D4F2D3] sm:inline-flex">
                {user?.name || user?.email}
              </span>

              {showAddTransaction && (
                <Link
                  href="/transactions?add=true"
                  className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-4 py-2 text-sm font-semibold text-[#022C22] transition duration-300 hover:-translate-y-0.5 hover:bg-[#34D399]"
                >
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Link>
              )}

              <Link
                href="/dashboard"
                className="rounded-full border border-[#10B981]/40 px-4 py-2 text-[#D4F2D3] transition hover:border-[#10B981] hover:text-white"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-[#10B981] px-5 py-2 text-white shadow-[0_0_0_rgba(16,185,129,0.15)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/signup"
              className="rounded-full bg-[#10B981] px-5 py-2 text-white shadow-[0_0_0_rgba(16,185,129,0.15)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            >
              Sign Up
            </Link>
          )}
        </nav>
      </div>

      {isMenuOpen && (
        <div className="border-t border-[#334155] bg-[#0F172A]/95 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            {mobileLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl border border-[#1F2937] bg-[#111827]/70 px-4 py-3 text-sm font-semibold text-[#E2E8F0]"
              >
                {link.label}
              </Link>
            ))}

            {isLoading ? null : isAuthenticated ? (
              <>
                <div className="rounded-2xl border border-[#10B981]/20 bg-[#10B981]/10 px-4 py-3 text-sm text-[#D4F2D3]">
                  {user?.name || user?.email}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-full bg-[#10B981] px-4 py-3 text-sm font-semibold text-white"
                >
                  Logout
                </button>
                <Link
                  href="/transactions?add=true"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-semibold text-[#022C22] transition hover:bg-[#34D399]"
                >
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Link>
              </>
            ) : (
              <Link
                href="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="w-full rounded-full bg-[#10B981] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
