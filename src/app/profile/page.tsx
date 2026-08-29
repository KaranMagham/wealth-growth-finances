"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    BadgeCheck,
    Bell,
    Mail,
    Settings,
    ShieldAlert,
    User as UserIcon,
} from "lucide-react";
import { getSessionClient } from "@/lib/session-client";
import Navbar from "../../../components/Navbar";
import AppFooter from "../../components/AppFooter";

type SessionUser = {
    id: string;
    name?: string | null;
    email?: string | null;
    emailVerified?: boolean;
    image?: string | null;
    createdAt?: string;
};

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<SessionUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadSession() {
            const result = await getSessionClient();
            if (cancelled) return;

            if (!result.success || !result.session?.user) {
                router.push("/login");
                return;
            }

            setUser(result.session.user as SessionUser);
            setLoading(false);
        }

        loadSession();
        return () => {
            cancelled = true;
        };
    }, [router]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-[#0F172A] px-4 py-12 text-[#F8FAFC]">
                    <div className="mx-auto max-w-4xl animate-pulse">
                        <div className="h-40 rounded-3xl border border-[#334155] bg-[#111827]" />
                        <div className="mt-8 h-56 rounded-3xl border border-[#334155] bg-[#111827]" />
                    </div>
                </div>
            </>
        );
    }

    if (!user) return null;

    const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#0F172A] px-4 py-8 text-[#F8FAFC] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    {/* Hero */}
                    <section className="relative overflow-hidden rounded-3xl border border-[#10B981]/20 bg-gradient-to-br from-[#064E3B] via-[#0F172A] to-[#111827] p-6 shadow-2xl shadow-[#10B981]/10 sm:p-8">
                        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#10B981]/20 blur-3xl" />
                        <div className="absolute -bottom-20 left-10 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl" />

                        <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
                            <div className="group relative shrink-0">
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name || "User"}
                                        className="h-20 w-20 rounded-2xl border border-[#10B981]/30 object-cover shadow-lg shadow-[#10B981]/10 transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#10B981]/30 bg-[#10B981]/20 text-2xl font-bold text-[#6EE7B7] shadow-lg shadow-[#10B981]/10 transition-transform duration-300 group-hover:scale-105">
                                        {initial}
                                    </div>
                                )}
                                {user.emailVerified && (
                                    <span className="absolute -bottom-1.5 -right-1.5 rounded-full border-2 border-[#0F172A] bg-[#10B981] p-1">
                                        <BadgeCheck className="h-3.5 w-3.5 text-[#0F172A]" />
                                    </span>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6EE7B7]">
                                    Your account
                                </p>
                                <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                                    {user.name || "User"}
                                </h1>
                                <p className="mt-2 flex items-center justify-center gap-2 text-sm text-[#CBD5E1] sm:justify-start">
                                    <Mail className="h-4 w-4 text-[#64748B]" />
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Details card */}
                    <section className="mt-8 animate-[fadeSlideIn_0.35s_ease-out_backwards] rounded-3xl border border-[#334155] bg-[#111827] p-6 shadow-lg sm:p-8">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-[#64748B]" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
                                Account details
                            </h2>
                        </div>

                        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-[#334155] bg-[#0F172A]/60 p-4 transition-colors duration-200 hover:border-[#475569]">
                                <dt className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                                    Name
                                </dt>
                                <dd className="mt-1 text-sm font-medium text-[#F8FAFC]">
                                    {user.name || "—"}
                                </dd>
                            </div>

                            <div className="rounded-2xl border border-[#334155] bg-[#0F172A]/60 p-4 transition-colors duration-200 hover:border-[#475569]">
                                <dt className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                                    Email
                                </dt>
                                <dd className="mt-1 text-sm font-medium text-[#F8FAFC]">
                                    {user.email}
                                </dd>
                            </div>

                            {user.emailVerified !== undefined && (
                                <div className="rounded-2xl border border-[#334155] bg-[#0F172A]/60 p-4 transition-colors duration-200 hover:border-[#475569]">
                                    <dt className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                                        Email verified
                                    </dt>
                                    <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                                        {user.emailVerified ? (
                                            <span className="flex items-center gap-1.5 text-[#6EE7B7]">
                                                <BadgeCheck className="h-4 w-4" />
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-amber-300">
                                                <ShieldAlert className="h-4 w-4" />
                                                Not verified
                                            </span>
                                        )}
                                    </dd>
                                </div>
                            )}
                        </dl>

                        {/* Actions */}
                        <div className="mt-6 flex flex-wrap gap-3 border-t border-[#334155] pt-6">
                            <a
                                href="/notification-preferences"
                                className="group inline-flex items-center gap-2 rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-2.5 text-sm font-semibold text-[#6EE7B7] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#10B981]/20 hover:shadow-lg hover:shadow-[#10B981]/10"
                            >
                                <Bell className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                                Notification Preferences
                            </a>

                            <a
                                href="/settings"
                                className="group inline-flex items-center gap-2 rounded-xl border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-sm font-semibold text-[#CBD5E1] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#475569] hover:text-[#F8FAFC]"
                            >
                                <Settings className="h-4 w-4 transition-transform duration-200 group-hover:rotate-45" />
                                Settings
                            </a>
                        </div>
                    </section>
                </div>
            </main>
            <AppFooter />

            <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </>
    );
}