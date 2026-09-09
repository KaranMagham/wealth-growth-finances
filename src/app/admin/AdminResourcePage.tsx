"use client";

import { useEffect, useState } from "react";

type Column<T> = { key: keyof T; label: string; format?: (value: T[keyof T], row: T) => React.ReactNode };

export default function AdminResourcePage<T extends Record<string, unknown>>({
  title,
  eyebrow,
  description,
  endpoint,
  columns,
}: {
  title: string;
  eyebrow: string;
  description: string;
  endpoint: string;
  columns: Column<T>[];
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(endpoint, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load data");
        setRows(Array.isArray(data.rows) ? data.rows : []);
      })
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Unable to load data"))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return <div className="space-y-6"><header><p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#10B981]">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold">{title}</h1><p className="mt-2 text-[#7894AA]">{description}</p></header><section className="overflow-hidden rounded-2xl border border-[#1E3347] bg-[#0D1D2E]">{loading ? <div className="p-8 text-[#7894AA]">Loading records...</div> : error ? <div className="p-8 text-rose-300">{error}</div> : rows.length === 0 ? <div className="p-10 text-center text-[#7894AA]">No records available.</div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-[#1E3347] text-xs uppercase tracking-wider text-[#5D7890]"><tr>{columns.map((column) => <th key={String(column.key)} className="whitespace-nowrap px-5 py-4">{column.label}</th>)}</tr></thead><tbody className="divide-y divide-[#1E3347]">{rows.map((row, index) => <tr key={String(row._id ?? index)} className="hover:bg-[#102437]"><td className="px-5 py-4">{columns[0].format ? columns[0].format(row[columns[0].key], row) : String(row[columns[0].key] ?? "-")}</td>{columns.slice(1).map((column) => <td key={String(column.key)} className="whitespace-nowrap px-5 py-4 text-[#B3C5D3]">{column.format ? column.format(row[column.key], row) : String(row[column.key] ?? "-")}</td>)}</tr>)}</tbody></table></div>}</section></div>;
}
