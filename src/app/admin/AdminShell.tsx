"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, Bot, BriefcaseBusiness, ChevronDown, CircleAlert, FileClock, LayoutDashboard, LineChart, Settings, ShieldCheck, Target, Users, WalletCards } from "lucide-react";
import { useState } from "react";

const sections = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }] },
  {
    label: "Platform",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Financial activity", href: "/admin/financial-activity", icon: WalletCards },
      { label: "Goals & contributions", href: "/admin/goals", icon: Target },
      { label: "Investments", href: "/admin/investments", icon: BriefcaseBusiness },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
    ],
  },
  {
    label: "Assistant",
    items: [
      { label: "Overview", href: "/admin/assistant", icon: Bot },
      { label: "Question library", href: "/admin/assistant/questions", icon: FileClock },
      { label: "Failed queries", href: "/admin/assistant/failed-queries", icon: CircleAlert },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: LineChart },
      { label: "Audit logs", href: "/admin/audit-logs", icon: ShieldCheck },
      { label: "Errors", href: "/admin/errors", icon: CircleAlert },
      { label: "System", href: "/admin/system", icon: BarChart3 },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07111f] text-[#F8FAFC]">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[#1E3347] bg-[#0A1727] transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="border-b border-[#1E3347] px-6 py-6">
            <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981] font-black text-[#03251b]">WG</div>
              <div><p className="text-sm font-semibold tracking-wide">WEALTH GROWTH</p><p className="text-xs text-[#7190A8]">Admin console</p></div>
            </Link>
          </div>
          <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
            {sections.map((section) => (
              <div key={section.label}>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5D7890]">{section.label}</p>
                <div className="mt-2 space-y-1">
                  {section.items.map(({ label, href, icon: Icon }) => {
                    const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                    return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-[#10B981]/15 text-[#6EE7B7]" : "text-[#A9BDD0] hover:bg-[#102437] hover:text-white"}`}><Icon className="h-4 w-4" />{label}</Link>;
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-[#1E3347] p-4"><Link href="/dashboard" className="flex items-center justify-between rounded-xl bg-[#102437] px-3 py-2.5 text-sm text-[#A9BDD0] hover:text-white">Back to app<ChevronDown className="h-4 w-4 -rotate-90" /></Link></div>
        </div>
      </aside>
      {mobileOpen && <button type="button" aria-label="Close admin navigation" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#1E3347] bg-[#07111f]/90 px-4 backdrop-blur lg:px-8">
          <button type="button" className="rounded-lg border border-[#29445A] px-3 py-2 text-sm text-[#A9BDD0] lg:hidden" onClick={() => setMobileOpen(true)}>Menu</button>
          <div className="ml-auto flex items-center gap-3 text-sm text-[#7894AA]"><ShieldCheck className="h-4 w-4 text-[#10B981]" /> Administrator</div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
