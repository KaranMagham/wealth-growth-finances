"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type UserRow = { _id: string; user: string; email: string; createdAt: string; goals: number; transactions: number; contributions: number; investments: number };

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      fetch(`/api/admin/users?limit=25&page=${page}&search=${encodeURIComponent(search)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load users");
        setRows(data.rows || []);
        setPages(data.pagination?.pages || 1);
      })
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Unable to load users"))
      .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [page, search]);

  function updateSearch(value: string) {
    setPage(1);
    setSearch(value);
  }

  return <div className="space-y-6">
    <header><p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#10B981]">Platform</p><h1 className="mt-2 text-3xl font-semibold">Users</h1><p className="mt-2 text-[#7894AA]">Paginated aggregate visibility for platform support.</p></header>
    <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search name or email" className="w-full max-w-md rounded-xl border border-[#29445A] bg-[#0D1D2E] px-4 py-3 text-white outline-none focus:border-[#10B981]" />
    <div className="overflow-x-auto rounded-2xl border border-[#1E3347] bg-[#0D1D2E]">
      {loading ? <p className="p-8 text-[#7894AA]">Loading users...</p> : error ? <p className="p-8 text-rose-300">{error}</p> : <table className="min-w-full text-left text-sm"><thead className="border-b border-[#1E3347] text-xs uppercase tracking-wider text-[#5D7890]"><tr>{["User", "Email", "Created", "Goals", "Transactions", "Contributions", "Investments", "Action"].map((heading) => <th key={heading} className="whitespace-nowrap px-5 py-4">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#1E3347]">{rows.map((row) => <tr key={row._id}><td className="px-5 py-4 font-medium text-white">{row.user}</td><td className="px-5 py-4 text-[#B3C5D3]">{row.email}</td><td className="px-5 py-4 text-[#B3C5D3]">{row.createdAt}</td><td className="px-5 py-4">{row.goals}</td><td className="px-5 py-4">{row.transactions}</td><td className="px-5 py-4">{row.contributions}</td><td className="px-5 py-4">{row.investments}</td><td className="px-5 py-4"><Link href={`/admin/users/${row._id}`} className="text-[#6EE7B7] hover:text-white">View</Link></td></tr>)}</tbody></table>}
    </div>
    <div className="flex items-center justify-between text-sm text-[#7894AA]"><span>Page {page} of {pages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-[#29445A] px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button type="button" disabled={page >= pages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-[#29445A] px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>
  </div>;
}
