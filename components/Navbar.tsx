"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from '@/hooks/useSession'

const Navbar = () => {
  const { status, session } = useSession()
  const router = useRouter()

  const user = session?.user
  const isAuthenticated = status === 'authenticated' && !!user
  const isLoading = status === 'loading'

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST', credentials: 'include' })
    } finally {
      router.push('/login')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#334155] bg-[#0F172A]/90 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
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

        <nav className="flex items-center gap-6 text-sm font-semibold text-[#E2E8F0]">
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
    </header>
  )
}

export default Navbar
