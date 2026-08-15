"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useSession } from "@/hooks/useSession";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TRANSACTION_TYPES } from "@/constants/transaction";
import AppFooter from "../../components/AppFooter";

interface TransactionRecord {
    _id: string;
    type: "Income" | "Expense";
    amount: number;
    category: string;
    description: string;
    paymentMethod: string;
    date: string;
    createdAt: string;
}

const initialForm = {
    type: "Expense" as "Income" | "Expense",
    amount: "",
    category: "",
    description: "",
    paymentMethod: "Cash",
    date: new Date().toISOString().slice(0, 10),
};

const PAYMENT_METHODS = [
    "Cash",
    "Online",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Cheque",
    "Other",
] as const;

export default function TransactionsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [form, setForm] = useState(initialForm);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [filterType, setFilterType] = useState("All");
    const [filterCategory, setFilterCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        try {
            const res = await fetch("/api/transactions");
            const payload = await res.json();

            if (payload.success) {
                setTransactions(payload.transactions || []);
            } else {
                setMessage(payload.message || "Unable to load transactions");
            }
        } catch (error) {
            console.error(error);
            setMessage("Unable to load transactions");
        } finally {
            setHasLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        if (status === "authenticated") {
            const timer = window.setTimeout(() => {
                void fetchTransactions();
            }, 0);

            return () => window.clearTimeout(timer);
        }
    }, [router, status, fetchTransactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter((item) => {
            const matchesType = filterType === "All" || item.type === filterType;
            const matchesCategory = filterCategory === "All" || item.category === filterCategory;
            const term = search.toLowerCase();
            const matchesSearch =
                !term ||
                item.description.toLowerCase().includes(term) ||
                item.category.toLowerCase().includes(term);

            return matchesType && matchesCategory && matchesSearch;
        });
    }, [transactions, filterType, filterCategory, search]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage(null);

        try {
            const endpoint = editingId ? `/api/transactions/${editingId}` : "/api/transactions";
            const method = editingId ? "PATCH" : "POST";
            const payload = {
                ...form,
                amount: Number(form.amount),
            };

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setMessage(data.message || "Unable to save transaction");
                return;
            }

            setMessage(editingId ? "Transaction updated" : "Transaction added");
            setForm(initialForm);
            setEditingId(null);
            setHasLoaded(false);
            await fetchTransactions();
        } catch (error) {
            console.error(error);
            setMessage("Something went wrong");
        }
    };

    const handleEdit = (transaction: TransactionRecord) => {
        setEditingId(transaction._id);
        setForm({
            type: transaction.type,
            amount: String(transaction.amount),
            category: transaction.category,
            description: transaction.description,
            paymentMethod: transaction.paymentMethod,
            date: transaction.date.slice(0, 10),
        });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this transaction?")) return;

        try {
            const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setMessage(data.message || "Unable to delete transaction");
                return;
            }
            setMessage("Transaction removed");
            setHasLoaded(false);
            await fetchTransactions();
        } catch (error) {
            console.error(error);
            setMessage("Unable to delete transaction");
        }
    };

    const availableCategories = form.type === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    if (status === "loading") {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)] px-4 py-10 text-white">
                    <div className="mx-auto max-w-6xl">Loading transactions...</div>
                </main>
                <Footer />
            </>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0F172A_60%,#111827_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div>
                            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#10B981]">
                                <ArrowLeft className="h-4 w-4" />
                                Back to dashboard
                            </Link>
                            <h1 className="mt-2 text-3xl font-semibold">Transactions</h1>
                            <p className="mt-2 text-sm text-[#94A3B8]">Track every income and expense in one place.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-6 rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 shadow-[0_0_40px_rgba(16,185,129,0.08)] sm:p-6">
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#94A3B8]">
                            <Plus className="h-4 w-4 text-[#10B981]" />
                            {editingId ? "Edit Transaction" : "Add Transaction"}
                        </div>
                        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <label className="text-sm text-[#E2E8F0]">
                                <span className="mb-2 block">Type</span>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "Income" | "Expense", category: "" })} className="w-full rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-white">
                                    {TRANSACTION_TYPES.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="text-sm text-[#E2E8F0]">
                                <span className="mb-2 block">Amount</span>
                                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-white" placeholder="0.00" required />
                            </label>

                            <label className="text-sm text-[#E2E8F0]">
                                <span className="mb-2 block">Category</span>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-white" required>
                                    <option value="">Select</option>
                                    {availableCategories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="text-sm text-[#E2E8F0]">
                                <span className="mb-2 block">Payment Method</span>

                                <select
                                    value={form.paymentMethod}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            paymentMethod: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-white"
                                    required
                                >
                                    {PAYMENT_METHODS.map((method) => (
                                        <option key={method} value={method}>
                                            {method}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                            <label className="text-sm text-[#E2E8F0]">
                                <span className="mb-2 block">Description</span>
                                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-white" placeholder="Groceries, salary, etc." />
                            </label>

                            <label className="text-sm text-[#E2E8F0]">
                                <span className="mb-2 block">Date</span>
                                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-white" required />
                            </label>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <button type="submit" className="rounded-full bg-[#10B981] px-4 py-2 font-semibold text-white">{editingId ? "Save changes" : "Add transaction"}</button>
                            {editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }} className="rounded-full border border-[#334155] px-4 py-2 text-sm text-[#E2E8F0]">Cancel</button> : null}
                        </div>
                        {message ? <p className="mt-3 text-sm text-[#D4F2D3]">{message}</p> : null}
                    </form>

                    <section className="rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 shadow-[0_0_40px_rgba(16,185,129,0.08)] sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                                <p className="mt-1 text-sm text-[#94A3B8]">Filter and review your records.</p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <label className="flex items-center gap-2 rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-sm text-[#E2E8F0]">
                                    <Search className="h-4 w-4 text-[#10B981]" />
                                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="bg-transparent outline-none" />
                                </label>
                                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-sm text-[#E2E8F0]">
                                    <option value="All">All Types</option>
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                </select>
                                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-sm text-[#E2E8F0]">
                                    <option value="All">All Categories</option>
                                    {[...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])].map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-5 overflow-hidden rounded-2xl border border-[#1F2937]">
                            {!hasLoaded ? (
                                <div className="p-6 text-sm text-[#94A3B8]">Loading...</div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="p-6 text-sm text-[#94A3B8]">No transactions yet.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-[#111827] text-[#94A3B8]">
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Category</th>
                                                <th className="px-4 py-3">Description</th>
                                                <th className="px-4 py-3">Amount</th>
                                                <th className="px-4 py-3">Type</th>
                                                <th className="px-4 py-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.map((item) => (
                                                <tr key={item._id} className="border-t border-[#1F2937] bg-[#0F172A]/70">
                                                    <td className="px-4 py-3">{new Date(item.date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3">{item.category}</td>
                                                    <td className="px-4 py-3">{item.description || "—"}</td>
                                                    <td className={`px-4 py-3 font-semibold ${item.type === "Income" ? "text-[#10B981]" : "text-rose-400"}`}>{item.type === "Income" ? "+" : "-"}₹{Number(item.amount).toLocaleString()}</td>
                                                    <td className="px-4 py-3">{item.type}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => handleEdit(item)} className="rounded-full border border-[#334155] p-2 text-[#10B981]" aria-label="Edit transaction">
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(item._id)} className="rounded-full border border-[#334155] p-2 text-rose-400" aria-label="Delete transaction">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
            <AppFooter />
        </>
    );
}
