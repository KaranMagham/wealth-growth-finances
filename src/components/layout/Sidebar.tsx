"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Transactions", href: "/transactions" },
  { name: "Budgets", href: "/budgets" },
  { name: "Goals", href: "/goals" },
  { name: "Investments", href: "/investments" },
  { name: "Analysis", href: "/analysis" },
  { name: "AI Insights", href: "/ai-insights" },
  { name: "Notifications", href: "/notifications" },
  { name: "Profile", href: "/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-900">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <div className="px-4 mb-6">
          <Link href="/dashboard" className="text-white text-xl font-bold">
            Wealth Growth
          </Link>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md
                  ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}