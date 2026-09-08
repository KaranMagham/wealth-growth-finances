"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  lastLoginAt: string | null;
  lastLogoutAt: string | null;
  online: boolean;
  lastSeenAt: string | null;
  sessionStartedAt: string | null;
  sessionDurationMs: number | null;
};

type Activity = { userId: string; description: string; timestamp: string };

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Never";
}

function formatDuration(milliseconds: number | null) {
  if (milliseconds === null) return "Unavailable";
  const minutes = Math.floor(milliseconds / 60000);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function AdminPage() {
  const router = useRouter();
  const { status } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [summary, setSummary] = useState({ totalUsers: 0, onlineUsers: 0, offlineUsers: 0, recentlyActiveUsers: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [router, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const load = async () => {
      const [overviewResponse, activityResponse] = await Promise.all([
        fetch("/api/admin/overview", { cache: "no-store" }),
        fetch("/api/admin/activity?limit=50", { cache: "no-store" }),
      ]);
      if (overviewResponse.status === 403) {
        setError("You are not authorized to view this page.");
        return;
      }
      if (!overviewResponse.ok || !activityResponse.ok) {
        setError("Unable to load admin data.");
        return;
      }
      const overview = await overviewResponse.json();
      const activity = await activityResponse.json();
      setSummary(overview.summary);
      setUsers(overview.users);
      setActivities(activity.activities);
    };
    void load();
  }, [status]);

  if (status !== "authenticated") return null;
  if (error) return <main className="min-h-screen bg-slate-950 p-8 text-white">{error}</main>;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-sm uppercase tracking-widest text-emerald-400">Administration</p>
          <h1 className="mt-2 text-3xl font-semibold">Usage overview</h1>
        </header>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Registered users", summary.totalUsers],
            ["Online now", summary.onlineUsers],
            ["Offline", summary.offlineUsers],
            ["Active in 24 hours", summary.recentlyActiveUsers],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </section>
        <section className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-5"><h2 className="text-lg font-semibold">Users</h2></div>
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400"><tr><th className="p-4">User</th><th className="p-4">Status</th><th className="p-4">Last login</th><th className="p-4">Last logout</th><th className="p-4">Last seen</th><th className="p-4">Session duration</th></tr></thead>
            <tbody>{users.map((user) => <tr key={user.id} className="border-t border-slate-800"><td className="p-4"><div>{user.name || "Unnamed user"}</div><div className="text-slate-500">{user.email || user.id}</div></td><td className="p-4"><span className={user.online ? "text-emerald-400" : "text-slate-500"}>{user.online ? "● Online" : "● Offline"}</span></td><td className="p-4 text-slate-300">{formatDate(user.lastLoginAt)}</td><td className="p-4 text-slate-300">{formatDate(user.lastLogoutAt)}</td><td className="p-4 text-slate-300">{formatDate(user.lastSeenAt)}</td><td className="p-4 text-slate-300">{formatDuration(user.sessionDurationMs)}</td></tr>)}</tbody>
          </table>
        </section>
        <section className="rounded-lg border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-5"><h2 className="text-lg font-semibold">Recent activity</h2></div>
          <div className="divide-y divide-slate-800">{activities.map((activity, index) => <div key={`${activity.timestamp}-${index}`} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"><span>{activity.description}</span><time className="text-sm text-slate-500">{formatDate(activity.timestamp)}</time></div>)}</div>
        </section>
      </div>
    </main>
  );
}