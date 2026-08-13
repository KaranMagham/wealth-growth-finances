import Link from "next/link";

const navigationLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transactions", href: "/transactions" },
  { label: "Budgets", href: "/budgets" },
  { label: "Goals", href: "/goals" },
  { label: "Reports", href: "/reports" },
];

const utilityLinks = [
  { label: "Help & Support", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function AppFooter() {
  return (
    <footer className="border-t border-[#1F2937] bg-[#020617] text-[#94A3B8]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs">
            <Link
              href="/dashboard"
              className="text-lg font-semibold text-white transition hover:text-[#10B981]"
            >
              Wealth Growth
            </Link>

            <p className="mt-2 text-sm leading-6">
              Your personal finance command center.
            </p>
          </div>

          <nav
            aria-label="Application navigation"
            className="flex flex-wrap gap-x-6 gap-y-3 text-sm"
          >
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-[#10B981]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <nav
            aria-label="Support navigation"
            className="flex flex-wrap gap-x-6 gap-y-3 text-sm"
          >
            {utilityLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-[#10B981]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-[#1F2937] pt-5 text-sm">
          © {new Date().getFullYear()} Wealth Growth
        </div>
      </div>
    </footer>
  );
}