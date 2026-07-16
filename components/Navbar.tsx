import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
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
          <Link href="/about" className="transition hover:text-[#10B981]">
            About
          </Link>
          <Link href="/support" className="transition hover:text-[#10B981]">
            Support
          </Link>
          <span className="text-[#334155]">|</span>
          <Link
            href="/login"
            className="rounded-full bg-[#10B981] px-5 py-2 text-white transition hover:bg-[#059669]"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
