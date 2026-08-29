"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, ChevronDown, Plus } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import NotificationBell from "@/components/notifications/NotificationBell";


const Navbar = () => {
  const { status, session } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const pathname = usePathname();

  const showAddTransaction = pathname !== "/transactions";
  const user = session?.user
  const isAuthenticated = status === 'authenticated' && !!user
  const isLoading = status === 'loading'

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setIsMenuOpen(false);
      setIsMoreOpen(false);
      router.push("/login");
    }
  };

  const mobileLinks = isAuthenticated
    ? [
      { href: "/", label: "Home" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/transactions", label: "Transactions" },
      { href: "/budgets", label: "Budgets" },
      { href: "/goals", label: "Goals" },
      { href: "/investments", label: "Assets" },
      { href: "/analysis", label: "Analysis & Reports" },
      { href: "/contact", label: "Help Center" },
    ]
    : [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Help Center" },
    ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#334155] bg-[#0F172A]/90 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => {
            setIsMenuOpen(false);
            setIsMoreOpen(false);
          }}
        >
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
          onClick={() => {
            setIsMenuOpen((open) => !open);
            setIsMoreOpen(false);
          }}
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

              <NotificationBell userId={user.id} />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreOpen((open) => !open)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#10B981]/30 px-4 py-2 text-[#D4F2D3] transition hover:border-[#10B981] hover:text-white"
                  aria-expanded={isMoreOpen}
                >
                  More
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isMoreOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isMoreOpen && (
                  <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-[#334155] bg-[#0F172A] p-2 shadow-2xl">
                    {[
                      { href: "/transactions", label: "Transactions" },
                      { href: "/budgets", label: "Budgets" },
                      { href: "/goals", label: "Goals" },
                      { href: "/investments", label: "Assets" },
                      { href: "/analysis", label: "Analysis & Reports" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMoreOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-[#CBD5E1] transition hover:bg-[#111827] hover:text-[#10B981]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {showAddTransaction && (
                <Link
                  href="/transactions?add=true"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-3 text-sm font-semibold text-[#D4F2D3] transition hover:border-[#10B981]/70 hover:bg-[#10B981]/20 hover:text-white"
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
              {user?.id && (
                <div className="flex justify-center py-2">
                  <NotificationBell userId={user.id} />
                </div>
              )}
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
                {/* <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMoreOpen((open) => !open)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#10B981]/30 px-4 py-2 text-[#D4F2D3] transition hover:border-[#10B981] hover:text-white"
                    aria-expanded={isMoreOpen}
                  >
                    More
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isMoreOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isMoreOpen && (
                    <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-[#334155] bg-[#0F172A] p-2 shadow-2xl">
                      <Link
                        href="/transactions"
                        onClick={() => setIsMoreOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-[#CBD5E1] transition hover:bg-[#111827] hover:text-[#10B981]"
                      >
                        Transactions
                      </Link>

                      <Link
                        href="/budgets"
                        onClick={() => setIsMoreOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-[#CBD5E1] transition hover:bg-[#111827] hover:text-[#10B981]"
                      >
                        Budgets
                      </Link>

                      <Link
                        href="/goals"
                        onClick={() => setIsMoreOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-[#CBD5E1] transition hover:bg-[#111827] hover:text-[#10B981]"
                      >
                        Goals
                      </Link>

                      <Link
                        href="/features"
                        onClick={() => setIsMoreOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-[#CBD5E1] transition hover:bg-[#111827] hover:text-[#10B981]"
                      >
                        Assets
                      </Link>

                      <Link
                        href="/reports"
                        onClick={() => setIsMoreOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-[#CBD5E1] transition hover:bg-[#111827] hover:text-[#10B981]"
                      >
                        Reports
                      </Link>
                    </div>
                    )}
                    </div> */}
                {showAddTransaction && (
                  <Link
                  href="/transactions?add=true"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-3 text-sm font-semibold text-[#D4F2D3] transition hover:border-[#10B981]/70 hover:bg-[#10B981]/20 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Transaction
                  </Link>
                )}
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
