"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    BriefcaseBusiness,
    ChartNoAxesCombined,
    Plus,
    RefreshCw,
    Search,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

import Navbar from "../../../components/Navbar";
import AppFooter from "../../components/AppFooter";
import { useSession } from "../../hooks/useSession";

const INVESTMENT_TYPES = [
    "Stocks",
    "Mutual Funds",
    "ETF",
    "Bonds",
    "Fixed Deposit",
    "Crypto",
    "Gold",
    "Other",
] as const;

type InvestmentType = (typeof INVESTMENT_TYPES)[number];

interface InvestmentRecord {
    id: string;
    name: string;
    type: InvestmentType;
    symbol: string;
    quantity: number;
    buyPrice: number;
    currentPrice: number;
    purchaseDate: string;
    notes: string;
    priceSource?: "MANUAL" | "MARKET_API";
    priceUpdatedAt?: string;
}

interface InvestmentApiRecord {
    _id: string;
    name: string;
    type: InvestmentType;
    symbol?: string;
    quantity: number;
    averageBuyPrice: number;
    currentPrice: number;
    purchaseDate: string;
    notes?: string;
    priceSource?: "MANUAL" | "MARKET_API";
    priceUpdatedAt?: string;
}

interface InvestmentsResponse {
    success: boolean;
    investments?: InvestmentApiRecord[];
    message?: string;
}

interface InvestmentSummary {
    investmentCount: number;
    totalInvested: number;
    currentValue: number;
    profitLoss: number;
    returnPercentage: number;
}

interface AllocationItem {
    type: string;
    amount: number;
    investedAmount: number;
    investmentCount: number;
    percentage: number;
}

const initialForm = {
    name: "",
    type: "Stocks" as InvestmentType,
    symbol: "",
    quantity: "",
    buyPrice: "",
    currentPrice: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    notes: "",
};

const formatCurrency = (value: number) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

const formatDate = (date: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function InvestmentsPage() {
    const { status } = useSession();
    const router = useRouter();

    const [investments, setInvestments] = useState<
        InvestmentRecord[]
    >([]);

    const [form, setForm] = useState(initialForm);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [message, setMessage] = useState<string | null>(null);
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);
    const [quoteMessage, setQuoteMessage] = useState<string | null>(
        null
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingInvestments, setIsLoadingInvestments] =
        useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [serverSummary, setServerSummary] =
        useState<InvestmentSummary | null>(null);

    const [allocation, setAllocation] = useState<
        AllocationItem[]
    >([]);

    const fetchInvestments = useCallback(async () => {
        try {
            setIsLoadingInvestments(true);

            const response = await fetch("/api/investments", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const data: InvestmentsResponse =
                await response.json();

            if (!response.ok || !data.success) {
                setMessage(
                    data.message || "Unable to load investments."
                );
                return;
            }

            const records: InvestmentRecord[] = (
                data.investments || []
            ).map((investment) => ({
                id: investment._id,
                name: investment.name,
                type: investment.type,
                symbol: investment.symbol || "",
                quantity: Number(investment.quantity),
                buyPrice: Number(investment.averageBuyPrice),
                currentPrice: Number(investment.currentPrice),
                purchaseDate: investment.purchaseDate,
                notes: investment.notes || "",
                priceSource: investment.priceSource,
                priceUpdatedAt: investment.priceUpdatedAt,
            }));

            setInvestments(records);
        } catch (error) {
            console.error("Fetch investments error:", error);
            setMessage("Unable to load investments.");
        } finally {
            setIsLoadingInvestments(false);
        }
    }, []);

    const fetchSummary = useCallback(async () => {
        try {
            const response = await fetch(
                "/api/investments/summary",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                return;
            }

            setServerSummary(data.summary);
        } catch (error) {
            console.error("Fetch investment summary error:", error);
        }
    }, []);

    const fetchAllocation = useCallback(async () => {
        try {
            const response = await fetch(
                "/api/investments/allocation",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                return;
            }

            setAllocation(data.allocation || []);
        } catch (error) {
            console.error(
                "Fetch investment allocation error:",
                error
            );
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        if (status !== "authenticated") {
            return;
        }

        const timer = window.setTimeout(() => {
            void Promise.all([
                fetchInvestments(),
                fetchSummary(),
                fetchAllocation(),
            ]);
        }, 0);

        return () => {
            window.clearTimeout(timer);
        };
    }, [
        status,
        router,
        fetchInvestments,
        fetchSummary,
        fetchAllocation,
    ]);

    const filteredInvestments = useMemo(() => {
        const term = search.trim().toLowerCase();

        return [...investments]
            .filter((investment) => {
                const matchesSearch =
                    !term ||
                    investment.name.toLowerCase().includes(term) ||
                    investment.symbol.toLowerCase().includes(term);

                const matchesType =
                    filterType === "All" ||
                    investment.type === filterType;

                return matchesSearch && matchesType;
            })
            .sort((a, b) => {
                if (sortBy === "name") {
                    return a.name.localeCompare(b.name);
                }

                if (sortBy === "value") {
                    const aValue =
                        a.quantity * a.currentPrice;
                    const bValue =
                        b.quantity * b.currentPrice;

                    return bValue - aValue;
                }

                return (
                    new Date(b.purchaseDate).getTime() -
                    new Date(a.purchaseDate).getTime()
                );
            });
    }, [investments, search, filterType, sortBy]);

    const localSummary = useMemo(() => {
        const totalInvested = investments.reduce(
            (total, investment) =>
                total +
                investment.quantity * investment.buyPrice,
            0
        );

        const currentValue = investments.reduce(
            (total, investment) =>
                total +
                investment.quantity * investment.currentPrice,
            0
        );

        const profitLoss = currentValue - totalInvested;

        const returnPercentage =
            totalInvested > 0
                ? (profitLoss / totalInvested) * 100
                : 0;

        return {
            investmentCount: investments.length,
            totalInvested,
            currentValue,
            profitLoss,
            returnPercentage,
        };
    }, [investments]);

    const displayedSummary =
        serverSummary || localSummary;

    const fetchStockQuote = useCallback(async () => {
        const symbol = form.symbol.trim().toUpperCase();

        if (!symbol) {
            setQuoteMessage("Enter a stock symbol first.");
            return;
        }

        try {
            setIsLoadingQuote(true);
            setQuoteMessage(null);

            const response = await fetch(
                `/api/market/stocks/quote?symbol=${encodeURIComponent(symbol)}`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setQuoteMessage(
                    data.message || "Unable to load current price."
                );
                return;
            }

            const price = Number(data.quote?.price);

            if (!Number.isFinite(price) || price < 0) {
                setQuoteMessage("The market API returned an invalid price.");
                return;
            }

            setForm((current) => ({
                ...current,
                symbol,
                currentPrice: price.toFixed(2),
            }));

            setQuoteMessage(
                `Current price updated: ${formatCurrency(price)}`
            );
        } catch (error) {
            console.error("Fetch stock quote error:", error);
            setQuoteMessage("Unable to fetch the current price.");
        } finally {
            setIsLoadingQuote(false);
        }
    }, [form.symbol]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setMessage(null);

        const quantity = Number(form.quantity);
        const buyPrice = Number(form.buyPrice);

        const currentPrice =
            form.currentPrice.trim() === ""
                ? buyPrice
                : Number(form.currentPrice);

        if (
            !form.name.trim() ||
            !form.purchaseDate ||
            !Number.isFinite(quantity) ||
            quantity <= 0 ||
            !Number.isFinite(buyPrice) ||
            buyPrice <= 0 ||
            !Number.isFinite(currentPrice) ||
            currentPrice < 0
        ) {
            setMessage("Please enter valid investment details.");
            return;
        }

        try {
            setIsSaving(true);

            const response = await fetch(
                "/api/investments",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        name: form.name.trim(),
                        type: form.type,
                        symbol: form.symbol.trim().toUpperCase(),
                        quantity,
                        buyPrice,
                        currentPrice,
                        purchaseDate: form.purchaseDate,
                        notes: form.notes.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setMessage(
                    data.message ||
                    "Unable to create investment."
                );
                return;
            }

            setForm(initialForm);
            setMessage("Investment added successfully.");

            await Promise.all([
                fetchInvestments(),
                fetchSummary(),
                fetchAllocation(),
            ]);
        } catch (error) {
            console.error("Create investment error:", error);
            setMessage(
                "Something went wrong while creating the investment."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleRefreshAll = async () => {
        try {
            setIsRefreshing(true);
            setMessage(null);

            const response = await fetch(
                "/api/investments/refresh-all",
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setMessage(
                    data.message ||
                    "Unable to refresh investment prices."
                );
                return;
            }

            await Promise.all([
                fetchInvestments(),
                fetchSummary(),
                fetchAllocation(),
            ]);

            if (data.failedCount > 0) {
                setMessage(
                    `${data.updatedCount} investment(s) refreshed. ${data.failedCount} could not be updated.`
                );
            } else {
                setMessage(
                    `${data.updatedCount} investment(s) refreshed successfully.`
                );
            }
        } catch (error) {
            console.error("Refresh investments error:", error);
            setMessage("Unable to refresh investment prices.");
        } finally {
            setIsRefreshing(false);
        }
    };

    if (status === "loading") {
        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
                    <div className="mx-auto max-w-7xl">
                        Loading investments...
                    </div>
                </main>

                <AppFooter />
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
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-sm text-[#10B981] transition hover:text-[#34D399]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to dashboard
                        </Link>

                        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h1 className="text-3xl font-semibold sm:text-4xl">
                                    Investments
                                </h1>

                                <p className="mt-2 text-sm text-[#94A3B8]">
                                    Track your portfolio, returns, and allocation.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleRefreshAll}
                                disabled={isRefreshing}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#10B981]/40 px-4 py-2.5 text-sm font-semibold text-[#D4F2D3] transition hover:border-[#10B981] hover:bg-[#10B981]/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""
                                        }`}
                                />

                                {isRefreshing
                                    ? "Refreshing..."
                                    : "Refresh Prices"}
                            </button>
                        </div>
                    </header>

                    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            title="Total Invested"
                            value={formatCurrency(
                                displayedSummary.totalInvested
                            )}
                            icon={
                                <BriefcaseBusiness className="h-5 w-5" />
                            }
                        />

                        <SummaryCard
                            title="Current Value"
                            value={formatCurrency(
                                displayedSummary.currentValue
                            )}
                            icon={
                                <ChartNoAxesCombined className="h-5 w-5" />
                            }
                        />

                        <SummaryCard
                            title="Profit / Loss"
                            value={formatCurrency(
                                displayedSummary.profitLoss
                            )}
                            icon={
                                displayedSummary.profitLoss >= 0 ? (
                                    <TrendingUp className="h-5 w-5" />
                                ) : (
                                    <TrendingDown className="h-5 w-5" />
                                )
                            }
                            valueClass={
                                displayedSummary.profitLoss >= 0
                                    ? "text-[#10B981]"
                                    : "text-rose-400"
                            }
                        />

                        <SummaryCard
                            title="Overall Return"
                            value={`${displayedSummary.returnPercentage.toFixed(
                                2
                            )}%`}
                            icon={
                                displayedSummary.returnPercentage >= 0 ? (
                                    <TrendingUp className="h-5 w-5" />
                                ) : (
                                    <TrendingDown className="h-5 w-5" />
                                )
                            }
                            valueClass={
                                displayedSummary.returnPercentage >= 0
                                    ? "text-[#10B981]"
                                    : "text-rose-400"
                            }
                        />
                    </section>

                    <section className="mb-6 rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 shadow-[0_0_40px_rgba(16,185,129,0.08)] sm:p-6">
                        <div>
                            <h2 className="text-xl font-semibold">
                                Asset Allocation
                            </h2>

                            <p className="mt-1 text-sm text-[#94A3B8]">
                                See how your current portfolio is distributed.
                            </p>
                        </div>

                        {allocation.length === 0 ? (
                            <p className="mt-5 text-sm text-[#94A3B8]">
                                No allocation data available yet.
                            </p>
                        ) : (
                            <div className="mt-5 space-y-4">
                                {allocation.map((item) => (
                                    <div key={item.type}>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-[#E2E8F0]">
                                                {item.type}
                                            </span>

                                            <span className="text-[#94A3B8]">
                                                {item.percentage.toFixed(2)}%
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-[#1E293B]">
                                            <div
                                                className="h-full rounded-full bg-[#10B981] transition-all"
                                                style={{
                                                    width: `${Math.min(
                                                        item.percentage,
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>

                                        <p className="mt-1 text-xs text-[#64748B]">
                                            {formatCurrency(item.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="mb-6 rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 shadow-[0_0_40px_rgba(16,185,129,0.08)] sm:p-6">
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#94A3B8]">
                            <Plus className="h-4 w-4 text-[#10B981]" />
                            Add Investment
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-5"
                        >
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <FormInput
                                    label="Investment Name"
                                    value={form.name}
                                    onChange={(value) =>
                                        setForm((current) => ({
                                            ...current,
                                            name: value,
                                        }))
                                    }
                                    placeholder="Reliance Industries"
                                    required
                                />

                                <FormSelect
                                    label="Investment Type"
                                    value={form.type}
                                    onChange={(value) =>
                                        setForm((current) => ({
                                            ...current,
                                            type: value as InvestmentType,
                                        }))
                                    }
                                    options={INVESTMENT_TYPES}
                                />

                                <div className="text-sm text-[#E2E8F0]">
                                    <span className="mb-2 block">
                                        Symbol / Identifier
                                    </span>

                                    <div className="flex gap-2">
                                        <input
                                            value={form.symbol}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    symbol: event.target.value.toUpperCase(),
                                                }))
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    void fetchStockQuote();
                                                }
                                            }}
                                            placeholder="IBM"
                                            className="min-w-0 flex-1 rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-white uppercase outline-none transition focus:border-[#10B981]"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => void fetchStockQuote()}
                                            disabled={
                                                isLoadingQuote ||
                                                form.type !== "Stocks" ||
                                                !form.symbol.trim()
                                            }
                                            className="shrink-0 rounded-xl border border-[#10B981]/40 px-3 py-2 text-xs font-semibold text-[#D4F2D3] transition hover:border-[#10B981] hover:bg-[#10B981]/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isLoadingQuote ? "Loading..." : "Get Price"}
                                        </button>
                                    </div>

                                    {quoteMessage ? (
                                        <p className="mt-2 text-xs text-[#94A3B8]">
                                            {quoteMessage}
                                        </p>
                                    ) : null}
                                </div>

                                <FormInput
                                    label="Quantity"
                                    type="number"
                                    min="0"
                                    step="0.000001"
                                    value={form.quantity}
                                    onChange={(value) =>
                                        setForm((current) => ({
                                            ...current,
                                            quantity: value,
                                        }))
                                    }
                                    placeholder="10"
                                    required
                                />

                                <FormInput
                                    label="Buy Price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.buyPrice}
                                    onChange={(value) =>
                                        setForm((current) => ({
                                            ...current,
                                            buyPrice: value,
                                        }))
                                    }
                                    placeholder="1400"
                                    required
                                />

                                <FormInput
                                    label="Current Price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.currentPrice}
                                    onChange={(value) =>
                                        setForm((current) => ({
                                            ...current,
                                            currentPrice: value,
                                        }))
                                    }
                                    placeholder="Fetch using symbol"
                                    readOnly={form.type === "Stocks"}
                                    required
                                />

                                <FormInput
                                    label="Purchase Date"
                                    type="date"
                                    value={form.purchaseDate}
                                    onChange={(value) =>
                                        setForm((current) => ({
                                            ...current,
                                            purchaseDate: value,
                                        }))
                                    }
                                    required
                                />

                                <FormInput
                                    label="Notes"
                                    value={form.notes}
                                    onChange={(value) =>
                                        setForm((current) => ({
                                            ...current,
                                            notes: value,
                                        }))
                                    }
                                    placeholder="Long-term investment"
                                />
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-full bg-[#10B981] px-5 py-2.5 font-semibold text-[#022C22] transition hover:bg-[#34D399] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSaving
                                        ? "Saving..."
                                        : "Add Investment"}
                                </button>

                                {message ? (
                                    <p className="text-sm text-[#D4F2D3]">
                                        {message}
                                    </p>
                                ) : null}
                            </div>
                        </form>
                    </section>

                    <section className="rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 shadow-[0_0_40px_rgba(16,185,129,0.08)] sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Investment List
                                </h2>

                                <p className="mt-1 text-sm text-[#94A3B8]">
                                    Search, filter, and review your investments.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <label className="flex items-center gap-2 rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-sm text-[#E2E8F0]">
                                    <Search className="h-4 w-4 shrink-0 text-[#10B981]" />

                                    <input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search investments"
                                        className="w-full bg-transparent outline-none placeholder:text-[#64748B]"
                                    />
                                </label>

                                <select
                                    value={filterType}
                                    onChange={(event) =>
                                        setFilterType(event.target.value)
                                    }
                                    className="rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 pr-10 text-sm text-[#E2E8F0]"
                                >
                                    <option value="All">All Types</option>

                                    {INVESTMENT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(event) =>
                                        setSortBy(event.target.value)
                                    }
                                    className="rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 pr-10 text-sm text-[#E2E8F0]"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="name">Name</option>
                                    <option value="value">Current value</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-5 overflow-hidden rounded-2xl border border-[#1F2937]">
                            {isLoadingInvestments ? (
                                <div className="p-8 text-center text-sm text-[#94A3B8]">
                                    Loading investments...
                                </div>
                            ) : filteredInvestments.length === 0 ? (
                                <div className="p-8 text-center">
                                    <BriefcaseBusiness className="mx-auto h-10 w-10 text-[#475569]" />

                                    <h3 className="mt-3 text-lg font-semibold">
                                        No investments yet
                                    </h3>

                                    <p className="mt-1 text-sm text-[#94A3B8]">
                                        Add your first investment to start tracking your portfolio.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-[#111827] text-[#94A3B8]">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Investment
                                                </th>
                                                <th className="px-4 py-3">
                                                    Type
                                                </th>
                                                <th className="px-4 py-3">
                                                    Quantity
                                                </th>
                                                <th className="px-4 py-3">
                                                    Invested
                                                </th>
                                                <th className="px-4 py-3">
                                                    Current Value
                                                </th>
                                                <th className="px-4 py-3">
                                                    Profit / Loss
                                                </th>
                                                <th className="px-4 py-3">
                                                    Updated
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredInvestments.map(
                                                (investment) => {
                                                    const invested =
                                                        investment.quantity *
                                                        investment.buyPrice;

                                                    const currentValue =
                                                        investment.quantity *
                                                        investment.currentPrice;

                                                    const profitLoss =
                                                        currentValue - invested;

                                                    return (
                                                        <tr
                                                            key={investment.id}
                                                            className="border-t border-[#1F2937] bg-[#0F172A]/70"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium">
                                                                    {investment.name}
                                                                </div>

                                                                {investment.symbol ? (
                                                                    <div className="text-xs text-[#64748B]">
                                                                        {investment.symbol}
                                                                    </div>
                                                                ) : null}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                {investment.type}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                {investment.quantity}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                {formatCurrency(invested)}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                {formatCurrency(currentValue)}
                                                            </td>

                                                            <td
                                                                className={`px-4 py-3 font-semibold ${profitLoss >= 0
                                                                    ? "text-[#10B981]"
                                                                    : "text-rose-400"
                                                                    }`}
                                                            >
                                                                {profitLoss >= 0
                                                                    ? "+"
                                                                    : ""}
                                                                {formatCurrency(
                                                                    profitLoss
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3 text-xs text-[#94A3B8]">
                                                                {investment.priceUpdatedAt
                                                                    ? formatDate(
                                                                        investment.priceUpdatedAt
                                                                    )
                                                                    : "Manual"}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
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

function SummaryCard({
    title,
    value,
    icon,
    valueClass = "text-white",
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    valueClass?: string;
}) {
    return (
        <div className="rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-5 shadow-[0_0_30px_rgba(16,185,129,0.06)]">
            <div className="flex items-center justify-between">
                <span className="text-sm text-[#94A3B8]">
                    {title}
                </span>

                <span className="text-[#10B981]">
                    {icon}
                </span>
            </div>

            <p
                className={`mt-4 text-2xl font-semibold ${valueClass}`}
            >
                {value}
            </p>
        </div>
    );
}

function FormInput({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
    min,
    step,
    readOnly = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    min?: string;
    step?: string;
    readOnly?: boolean;
}) {
    return (
        <label className="text-sm text-[#E2E8F0]">
            <span className="mb-2 block">{label}</span>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                required={required}
                min={min}
                step={step}
                readOnly={readOnly}
                className={`w-full rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-white outline-none transition focus:border-[#10B981] ${readOnly
                        ? "cursor-not-allowed opacity-80"
                        : ""
                    }`}
            />
        </label>
    );
}

function FormSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: readonly string[];
}) {
    return (
        <label className="text-sm text-[#E2E8F0]">
            <span className="mb-2 block">{label}</span>

            <select
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="w-full rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 pr-10 text-white outline-none transition focus:border-[#10B981]"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </label>
    );
}