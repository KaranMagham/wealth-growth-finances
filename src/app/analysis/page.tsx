"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    BarChart3,
    BriefcaseBusiness,
    CalendarDays,
    ChartNoAxesCombined,
    CircleDollarSign,
    Download,
    Goal,
    PieChart as PieChartIcon,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import Navbar from "../../../components/Navbar";
import AppFooter from "../../components/AppFooter";
import { useSession } from "../../hooks/useSession";
import type {
    AnalysisPeriodKey,
    AnalysisResponse,
} from "@/lib/analysis/analysisTypes";

const PERIOD_OPTIONS: Array<{
    value: AnalysisPeriodKey;
    label: string;
}> = [
        {
            value: "this-month",
            label: "This Month",
        },
        {
            value: "last-3-months",
            label: "Last 3 Months",
        },
        {
            value: "last-6-months",
            label: "Last 6 Months",
        },
        {
            value: "this-year",
            label: "This Year",
        },
        {
            value: "custom",
            label: "Custom Range",
        },
    ];

const CHART_COLORS = [
    "#10B981",
    "#38BDF8",
    "#A78BFA",
    "#F59E0B",
    "#FB7185",
    "#22C55E",
    "#F97316",
    "#14B8A6",
    "#6366F1",
    "#E879F9",
];

type AnalysisApiResult =
    | AnalysisResponse
    | {
        success: false;
        message?: string;
    };

function getToday() {
    const now = new Date();

    const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60_000
    );

    return localDate.toISOString().slice(0, 10);
}

function getFirstDayOfMonth() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}-01`;
}

function formatCurrency(value: number) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}

function formatCompactCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(Number(value || 0));
}

function formatPercentage(value: number) {
    return `${Number(value || 0).toFixed(2)}%`;
}

function calculateProgress(
    current: number,
    total: number
) {
    if (total <= 0) {
        return 0;
    }

    return Math.min((current / total) * 100, 100);
}

export default function AnalysisPage() {
    const { status } = useSession();
    const router = useRouter();

    const [analysis, setAnalysis] =
        useState<AnalysisResponse | null>(null);

    const [period, setPeriod] =
        useState<AnalysisPeriodKey>("this-month");

    const [customFrom, setCustomFrom] = useState(
        getFirstDayOfMonth()
    );

    const [customTo, setCustomTo] = useState(getToday());

    const [appliedCustomFrom, setAppliedCustomFrom] =
        useState(getFirstDayOfMonth());

    const [appliedCustomTo, setAppliedCustomTo] =
        useState(getToday());

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [isDownloadingPdf, setIsDownloadingPdf] =
        useState(false);

    const loadAnalysis = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const params = new URLSearchParams({
                period,
            });

            if (period === "custom") {
                params.set("from", appliedCustomFrom);
                params.set("to", appliedCustomTo);
            }

            const response = await fetch(
                `/api/analysis?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                    },
                    cache: "no-store",
                }
            );

            const data =
                (await response.json()) as AnalysisApiResult;

            if (!response.ok || !data.success) {
                const message =
                    "message" in data ? data.message : undefined;

                setAnalysis(null);

                setError(
                    message || "Unable to load financial analysis."
                );

                return;
            }

            setAnalysis(data);
        } catch (error) {
            console.error("Load analysis error:", error);

            setAnalysis(null);
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load financial analysis."
            );
        } finally {
            setIsLoading(false);
        }
    }, [
        period,
        appliedCustomFrom,
        appliedCustomTo,
    ]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        if (status !== "authenticated") {
            return;
        }

        const timer = window.setTimeout(() => {
            void loadAnalysis();
        }, 0);

        return () => {
            window.clearTimeout(timer);
        };
    }, [status, router, loadAnalysis]);

    const hasAnyFinancialData = useMemo(() => {
        if (!analysis) {
            return false;
        }

        return Object.values(analysis.dataStatus).some(
            Boolean
        );
    }, [analysis]);

    const budgetProgress = useMemo(() => {
        if (!analysis) {
            return 0;
        }

        return calculateProgress(
            analysis.summary.budgetUsed,
            analysis.summary.budgetedAmount
        );
    }, [analysis]);

    const customRangeIsValid =
        customFrom &&
        customTo &&
        customFrom <= customTo;

    function handleApplyCustomRange() {
        if (!customRangeIsValid) {
            setError(
                "Choose a valid custom date range."
            );
            return;
        }

        setError("");
        setAppliedCustomFrom(customFrom);
        setAppliedCustomTo(customTo);
    }

    function handlePeriodChange(value: string) {
        setPeriod(value as AnalysisPeriodKey);
        setError("");
    }

    async function handleDownloadPdf() {
        try {
            setIsDownloadingPdf(true);
            setError("");

            const params = new URLSearchParams({
                period,
            });

            if (period === "custom") {
                params.set("from", appliedCustomFrom);
                params.set("to", appliedCustomTo);
            }

            const response = await fetch(
                `/api/analysis/report?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/pdf",
                    },
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                const contentType =
                    response.headers.get("content-type") || "";

                let message =
                    "Unable to download financial report.";

                if (contentType.includes("application/json")) {
                    const data = await response.json();

                    message = data.message || message;
                }

                throw new Error(message);
            }

            const pdfBlob = await response.blob();

            const contentDisposition =
                response.headers.get("content-disposition") || "";

            const fileNameMatch =
                contentDisposition.match(
                    /filename="([^"]+)"/
                );

            const fileName =
                fileNameMatch?.[1] ||
                `wealth-growth-analysis-${period}.pdf`;

            const fileUrl = URL.createObjectURL(pdfBlob);

            const link = document.createElement("a");

            link.href = fileUrl;
            link.download = fileName;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => {
                URL.revokeObjectURL(fileUrl);
            }, 1000);
        } catch (error) {
            console.error("Download PDF error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to download financial report."
            );
        } finally {
            setIsDownloadingPdf(false);
        }
    }

    if (status === "loading") {
        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
                    <div className="mx-auto max-w-7xl">
                        Loading analysis...
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
                            className="inline-flex items-center gap-2 text-sm text-[#10B981] hover:text-[#34D399]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to dashboard
                        </Link>

                        <div className="mt-4 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#10B981]">
                                    <ChartNoAxesCombined className="h-4 w-4" />
                                    Read-only financial intelligence
                                </div>

                                <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                                    Analysis & Reports
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">
                                    Review cash flow, budget usage,
                                    investment allocation, and goal progress
                                    without changing your financial records.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => void loadAnalysis()}
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 px-4 py-2.5 text-sm font-semibold text-[#D4F2D3] transition hover:bg-[#10B981]/10 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 ${isLoading ? "animate-spin" : ""
                                            }`}
                                    />
                                    Refresh analysis
                                </button>

                                <button
                                    type="button"
                                    onClick={() => void handleDownloadPdf()}
                                    disabled={isDownloadingPdf || !analysis}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-2.5 text-sm font-semibold text-[#D4F2D3] transition hover:border-[#10B981] hover:bg-[#10B981]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Download className="h-4 w-4" />

                                    {isDownloadingPdf
                                        ? "Generating PDF..."
                                        : "Download PDF"}
                                </button>
                            </div>
                        </div>
                    </header>

                    <section className="mb-6 rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
                                    <CalendarDays className="h-4 w-4 text-[#10B981]" />
                                    Analysis period
                                </div>

                                <p className="mt-2 text-sm text-[#94A3B8]">
                                    Charts and transaction summaries update
                                    for the selected period.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <label className="text-sm text-[#E2E8F0]">
                                    <span className="mb-2 block">
                                        Period
                                    </span>

                                    <select
                                        value={period}
                                        onChange={(event) =>
                                            handlePeriodChange(event.target.value)
                                        }
                                        className="min-w-52 rounded-xl border border-[#334155] bg-[#111827] px-3 py-2.5 text-white outline-none focus:border-[#10B981]"
                                    >
                                        {PERIOD_OPTIONS.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {period === "custom" && (
                                    <>
                                        <label className="text-sm text-[#E2E8F0]">
                                            <span className="mb-2 block">
                                                From
                                            </span>

                                            <input
                                                type="date"
                                                value={customFrom}
                                                onChange={(event) =>
                                                    setCustomFrom(event.target.value)
                                                }
                                                className="rounded-xl border border-[#334155] bg-[#111827] px-3 py-2.5 text-white outline-none focus:border-[#10B981]"
                                            />
                                        </label>

                                        <label className="text-sm text-[#E2E8F0]">
                                            <span className="mb-2 block">
                                                To
                                            </span>

                                            <input
                                                type="date"
                                                value={customTo}
                                                onChange={(event) =>
                                                    setCustomTo(event.target.value)
                                                }
                                                className="rounded-xl border border-[#334155] bg-[#111827] px-3 py-2.5 text-white outline-none focus:border-[#10B981]"
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            onClick={handleApplyCustomRange}
                                            disabled={
                                                isLoading || !customRangeIsValid
                                            }
                                            className="rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-[#022C22] transition hover:bg-[#34D399] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Apply range
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {analysis && (
                            <p className="mt-4 text-xs text-[#64748B]">
                                Showing data from {analysis.period.from} to{" "}
                                {analysis.period.to}.
                            </p>
                        )}
                    </section>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                            {error}
                        </div>
                    )}

                    {isLoading && !analysis ? (
                        <section className="rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-10 text-center">
                            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#10B981]" />

                            <p className="mt-4 text-sm text-[#94A3B8]">
                                Loading financial analysis...
                            </p>
                        </section>
                    ) : !analysis || !hasAnyFinancialData ? (
                        <section className="rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-10 text-center">
                            <ChartNoAxesCombined className="mx-auto h-11 w-11 text-[#475569]" />

                            <h2 className="mt-4 text-xl font-semibold">
                                No financial data available yet
                            </h2>

                            <p className="mx-auto mt-2 max-w-lg text-sm text-[#94A3B8]">
                                Add transactions, budgets, goals, or
                                investments to generate your financial
                                analysis.
                            </p>
                        </section>
                    ) : (
                        <>
                            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                                <SummaryCard
                                    title="Income"
                                    value={formatCurrency(
                                        analysis.summary.income
                                    )}
                                    detail={analysis.period.label}
                                    icon={
                                        <TrendingUp className="h-5 w-5" />
                                    }
                                    valueClass="text-[#10B981]"
                                />

                                <SummaryCard
                                    title="Expenses"
                                    value={formatCurrency(
                                        analysis.summary.expenses
                                    )}
                                    detail="Recorded spending"
                                    icon={
                                        <TrendingDown className="h-5 w-5" />
                                    }
                                    valueClass="text-rose-400"
                                />

                                <SummaryCard
                                    title="Savings"
                                    value={formatCurrency(
                                        analysis.summary.savings
                                    )}
                                    detail={`${formatPercentage(
                                        analysis.summary.savingsRate
                                    )} savings rate`}
                                    icon={<Wallet className="h-5 w-5" />}
                                    valueClass={
                                        analysis.summary.savings >= 0
                                            ? "text-[#10B981]"
                                            : "text-rose-400"
                                    }
                                />

                                <SummaryCard
                                    title="Investment value"
                                    value={formatCurrency(
                                        analysis.summary.investmentValue
                                    )}
                                    detail={`Invested: ${formatCompactCurrency(
                                        analysis.summary.totalInvested
                                    )}`}
                                    icon={
                                        <BriefcaseBusiness className="h-5 w-5" />
                                    }
                                />

                                <SummaryCard
                                    title="Investment P/L"
                                    value={`${analysis.summary.investmentProfitLoss >= 0 ? "+" : ""}${formatCurrency(
                                        analysis.summary.investmentProfitLoss
                                    )}`}
                                    detail={`${formatPercentage(
                                        analysis.summary
                                            .investmentReturnPercentage
                                    )} overall return`}
                                    icon={
                                        analysis.summary.investmentProfitLoss >=
                                            0 ? (
                                            <TrendingUp className="h-5 w-5" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5" />
                                        )
                                    }
                                    valueClass={
                                        analysis.summary.investmentProfitLoss >=
                                            0
                                            ? "text-[#10B981]"
                                            : "text-rose-400"
                                    }
                                />

                                {/* <SummaryCard
                                    title="Net worth"
                                    value={
                                        analysis.summary.currentNetWorth ===
                                            null
                                            ? "Not available"
                                            : formatCurrency(
                                                analysis.summary.currentNetWorth
                                            )
                                    }
                                    detail={
                                        analysis.summary.currentNetWorth ===
                                            null
                                            ? "Assets and liabilities not added"
                                            : "Current recorded net worth"
                                    }
                                    icon={
                                        <CircleDollarSign className="h-5 w-5" />
                                    }
                                    valueClass={
                                        analysis.summary.currentNetWorth ===
                                            null
                                            ? "text-[#94A3B8]"
                                            : "text-white"
                                    }
                                /> */}
                            </section>

                            <section className="mb-6 grid gap-6 xl:grid-cols-2">
                                <ChartPanel
                                    title="Expense breakdown"
                                    description="Where your recorded expenses went during the selected period."
                                    icon={
                                        <PieChartIcon className="h-5 w-5 text-[#10B981]" />
                                    }
                                >
                                    {analysis.expenseBreakdown.length === 0 ? (
                                        <EmptyChart message="No expense data is available for this period." />
                                    ) : (
                                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-center">
                                            <div className="h-72">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <PieChart>
                                                        <Pie
                                                            data={
                                                                analysis.expenseBreakdown
                                                            }
                                                            dataKey="amount"
                                                            nameKey="category"
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={58}
                                                            outerRadius={92}
                                                            paddingAngle={3}
                                                        >
                                                            {analysis.expenseBreakdown.map(
                                                                (item, index) => (
                                                                    <Cell
                                                                        key={item.category}
                                                                        fill={
                                                                            CHART_COLORS[
                                                                            index %
                                                                            CHART_COLORS.length
                                                                            ]
                                                                        }
                                                                    />
                                                                )
                                                            )}
                                                        </Pie>

                                                        <Tooltip
                                                            formatter={(value) =>
                                                                formatCurrency(Number(value))
                                                            }
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="space-y-3">
                                                {analysis.expenseBreakdown.map(
                                                    (item, index) => (
                                                        <div
                                                            key={item.category}
                                                            className="flex items-start justify-between gap-3 text-sm"
                                                        >
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <span
                                                                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            CHART_COLORS[
                                                                            index %
                                                                            CHART_COLORS.length
                                                                            ],
                                                                    }}
                                                                />

                                                                <span className="truncate text-[#CBD5E1]">
                                                                    {item.category}
                                                                </span>
                                                            </div>

                                                            <div className="shrink-0 text-right">
                                                                <p className="font-medium text-white">
                                                                    {formatCurrency(item.amount)}
                                                                </p>

                                                                <p className="text-xs text-[#64748B]">
                                                                    {formatPercentage(
                                                                        item.percentage
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </ChartPanel>

                                <ChartPanel
                                    title="Income vs expenses"
                                    description="Compare monthly income, expenses, and resulting savings."
                                    icon={
                                        <BarChart3 className="h-5 w-5 text-[#10B981]" />
                                    }
                                >
                                    <div className="h-80 rounded-2xl border border-[#1E293B] bg-[#111827] p-3">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={analysis.incomeExpenseTrend}
                                                margin={{
                                                    top: 10,
                                                    right: 8,
                                                    left: -12,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid
                                                    stroke="#334155"
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                />

                                                <XAxis
                                                    dataKey="label"
                                                    stroke="#94A3B8"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    fontSize={12}
                                                />

                                                <YAxis
                                                    stroke="#94A3B8"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    fontSize={12}
                                                    tickFormatter={formatCompactCurrency}
                                                />

                                                <Tooltip
                                                    formatter={(value) =>
                                                        formatCurrency(Number(value))
                                                    }
                                                    contentStyle={{
                                                        backgroundColor: "#020617",
                                                        border: "1px solid #334155",
                                                        borderRadius: "12px",
                                                        color: "#F8FAFC",
                                                        padding: "10px 12px",
                                                    }}
                                                    labelStyle={{
                                                        color: "#94A3B8",
                                                        marginBottom: "6px",
                                                    }}
                                                    itemStyle={{
                                                        color: "#E2E8F0",
                                                    }}
                                                    cursor={{
                                                        fill: "rgba(16, 185, 129, 0.10)",
                                                    }}
                                                    wrapperStyle={{
                                                        outline: "none",
                                                    }}
                                                />

                                                <Legend
                                                    formatter={(value) => (
                                                        <span className="text-sm text-[#CBD5E1]">
                                                            {value}
                                                        </span>
                                                    )}
                                                />

                                                <Bar
                                                    dataKey="income"
                                                    name="Income"
                                                    fill="#10B981"
                                                    radius={[6, 6, 0, 0]}
                                                />

                                                <Bar
                                                    dataKey="expenses"
                                                    name="Expenses"
                                                    fill="#FB7185"
                                                    radius={[6, 6, 0, 0]}
                                                />

                                                <Bar
                                                    dataKey="savings"
                                                    name="Savings"
                                                    fill="#38BDF8"
                                                    radius={[6, 6, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </ChartPanel>
                            </section>

                            <section className="mb-6 grid gap-6">
                                <ChartPanel
                                    title="Savings trend"
                                    description="Monthly cash remaining after recorded expenses."
                                    icon={
                                        <TrendingUp className="h-5 w-5 text-[#10B981]" />
                                    }
                                >
                                    <div className="h-80">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <LineChart
                                                data={analysis.savingsTrend}
                                                margin={{
                                                    top: 10,
                                                    right: 10,
                                                    left: -12,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid
                                                    stroke="#334155"
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                />

                                                <XAxis
                                                    dataKey="label"
                                                    stroke="#94A3B8"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    fontSize={12}
                                                />

                                                <YAxis
                                                    stroke="#94A3B8"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    fontSize={12}
                                                    tickFormatter={formatCompactCurrency}
                                                />

                                                <Tooltip
                                                    formatter={(value) =>
                                                        formatCurrency(Number(value))
                                                    }
                                                    contentStyle={{
                                                        background: "#0F172A",
                                                        border: "1px solid #334155",
                                                        borderRadius: "12px",
                                                    }}
                                                />

                                                <Line
                                                    type="monotone"
                                                    dataKey="savings"
                                                    name="Savings"
                                                    stroke="#10B981"
                                                    strokeWidth={3}
                                                    dot={{
                                                        r: 4,
                                                        fill: "#10B981",
                                                    }}
                                                    activeDot={{
                                                        r: 6,
                                                    }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </ChartPanel>

                                {/* <ChartPanel
                                    title="Net-worth history"
                                    description="Historical net worth requires saved asset, liability, and portfolio snapshots."
                                    icon={
                                        <ChartNoAxesCombined className="h-5 w-5 text-[#10B981]" />
                                    }
                                >
                                    <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-[#334155] bg-[#111827]/60 p-8 text-center">
                                        <CircleDollarSign className="h-10 w-10 text-[#475569]" />

                                        <h3 className="mt-4 text-lg font-semibold">
                                            Net-worth history is not available yet
                                        </h3>

                                        <p className="mt-2 max-w-md text-sm text-[#94A3B8]">
                                            Add Assets and Liabilities later, then
                                            save periodic net-worth snapshots to
                                            unlock this chart.
                                        </p>
                                    </div>
                                </ChartPanel> */}
                            </section>

                            <section className="mb-6 grid gap-6 xl:grid-cols-2">
                                <ChartPanel
                                    title="Investment distribution"
                                    description="Portfolio allocation based on current investment values."
                                    icon={
                                        <BriefcaseBusiness className="h-5 w-5 text-[#10B981]" />
                                    }
                                >
                                    {analysis.investmentDistribution.length ===
                                        0 ? (
                                        <EmptyChart message="No investment records are available yet." />
                                    ) : (
                                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-center">
                                            <div className="h-72">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <PieChart>
                                                        <Pie
                                                            data={
                                                                analysis.investmentDistribution
                                                            }
                                                            dataKey="amount"
                                                            nameKey="type"
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={58}
                                                            outerRadius={92}
                                                            paddingAngle={3}
                                                        >
                                                            {analysis.investmentDistribution.map(
                                                                (item, index) => (
                                                                    <Cell
                                                                        key={item.type}
                                                                        fill={
                                                                            CHART_COLORS[
                                                                            index %
                                                                            CHART_COLORS.length
                                                                            ]
                                                                        }
                                                                    />
                                                                )
                                                            )}
                                                        </Pie>

                                                        <Tooltip
                                                            formatter={(value) =>
                                                                formatCurrency(Number(value))
                                                            }
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="space-y-3">
                                                {analysis.investmentDistribution.map(
                                                    (item, index) => (
                                                        <div
                                                            key={item.type}
                                                            className="flex items-start justify-between gap-3 text-sm"
                                                        >
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <span
                                                                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            CHART_COLORS[
                                                                            index %
                                                                            CHART_COLORS.length
                                                                            ],
                                                                    }}
                                                                />

                                                                <span className="truncate text-[#CBD5E1]">
                                                                    {item.type}
                                                                </span>
                                                            </div>

                                                            <div className="shrink-0 text-right">
                                                                <p className="font-medium text-white">
                                                                    {formatPercentage(
                                                                        item.percentage
                                                                    )}
                                                                </p>

                                                                <p className="text-xs text-[#64748B]">
                                                                    {formatCompactCurrency(
                                                                        item.amount
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </ChartPanel>

                                <section className="rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 sm:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Goal className="h-5 w-5 text-[#10B981]" />

                                                <h2 className="text-xl font-semibold">
                                                    Goals overview
                                                </h2>
                                            </div>

                                            <p className="mt-2 text-sm text-[#94A3B8]">
                                                Track progress across your active and
                                                completed financial goals.
                                            </p>
                                        </div>

                                        <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#D4F2D3]">
                                            {analysis.goals.completedGoals}/
                                            {analysis.goals.totalGoals} completed
                                        </span>
                                    </div>

                                    {analysis.goals.totalGoals === 0 ? (
                                        <EmptyChart message="No financial goals are available yet." />
                                    ) : (
                                        <div className="mt-7">
                                            <div className="flex flex-wrap items-end justify-between gap-3">
                                                <div>
                                                    <p className="text-3xl font-semibold text-white">
                                                        {formatPercentage(
                                                            analysis.goals.overallProgress
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-sm text-[#94A3B8]">
                                                        Overall target progress
                                                    </p>
                                                </div>

                                                <div className="text-right text-sm">
                                                    <p className="font-medium text-white">
                                                        {formatCurrency(
                                                            analysis.goals.savedAmount
                                                        )}
                                                    </p>

                                                    <p className="text-[#64748B]">
                                                        of{" "}
                                                        {formatCurrency(
                                                            analysis.goals.targetAmount
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#1E293B]">
                                                <div
                                                    className="h-full rounded-full bg-[#10B981] transition-all"
                                                    style={{
                                                        width: `${analysis.goals.overallProgress}%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                                <MiniMetric
                                                    label="Total goals"
                                                    value={String(
                                                        analysis.goals.totalGoals
                                                    )}
                                                />

                                                <MiniMetric
                                                    label="Completed goals"
                                                    value={String(
                                                        analysis.goals.completedGoals
                                                    )}
                                                />

                                                <MiniMetric
                                                    label="Target amount"
                                                    value={formatCurrency(
                                                        analysis.goals.targetAmount
                                                    )}
                                                />

                                                <MiniMetric
                                                    label="Saved amount"
                                                    value={formatCurrency(
                                                        analysis.goals.savedAmount
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </section>
                            </section>

                            <section className="rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 sm:p-6">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Budget usage
                                        </h2>

                                        <p className="mt-1 text-sm text-[#94A3B8]">
                                            Budget usage includes expenses from
                                            categories that have a matching budget.
                                        </p>
                                    </div>

                                    <div className="text-left lg:text-right">
                                        <p className="text-xl font-semibold">
                                            {formatCurrency(
                                                analysis.summary.budgetUsed
                                            )}
                                            <span className="text-[#64748B]">
                                                {" "}
                                                /{" "}
                                                {formatCurrency(
                                                    analysis.summary.budgetedAmount
                                                )}
                                            </span>
                                        </p>

                                        <p className="mt-1 text-sm text-[#94A3B8]">
                                            {formatPercentage(budgetProgress)} used
                                        </p>
                                    </div>
                                </div>

                                {analysis.summary.budgetedAmount > 0 ? (
                                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#1E293B]">
                                        <div
                                            className={`h-full rounded-full transition-all ${budgetProgress > 100
                                                ? "bg-rose-400"
                                                : budgetProgress >= 80
                                                    ? "bg-amber-400"
                                                    : "bg-[#10B981]"
                                                }`}
                                            style={{
                                                width: `${Math.min(
                                                    budgetProgress,
                                                    100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <p className="mt-5 rounded-xl border border-dashed border-[#334155] bg-[#111827]/50 px-4 py-3 text-sm text-[#94A3B8]">
                                        No budgets are configured for this
                                        selected period.
                                    </p>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </main>

            <AppFooter />
        </>
    );
}

function SummaryCard({
    title,
    value,
    detail,
    icon,
    valueClass = "text-white",
}: {
    title: string;
    value: string;
    detail: string;
    icon: ReactNode;
    valueClass?: string;
}) {
    return (
        <div className="rounded-[24px] border border-[#334155] bg-[#0F172A]/90 p-5 shadow-[0_0_30px_rgba(16,185,129,0.06)]">
            <div className="flex items-center justify-between">
                <span className="text-sm text-[#94A3B8]">
                    {title}
                </span>

                <span className="text-[#10B981]">{icon}</span>
            </div>

            <p
                className={`mt-4 text-2xl font-semibold ${valueClass}`}
            >
                {value}
            </p>

            <p className="mt-2 text-xs text-[#64748B]">
                {detail}
            </p>
        </div>
    );
}

function ChartPanel({
    title,
    description,
    icon,
    children,
}: {
    title: string;
    description: string;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 sm:p-6">
            <div className="flex items-start gap-3">
                <span className="mt-0.5">{icon}</span>

                <div>
                    <h2 className="text-xl font-semibold">{title}</h2>

                    <p className="mt-1 text-sm text-[#94A3B8]">
                        {description}
                    </p>
                </div>
            </div>

            <div className="mt-6">{children}</div>
        </section>
    );
}

function EmptyChart({
    message,
}: {
    message: string;
}) {
    return (
        <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-[#334155] bg-[#111827]/60 px-6 text-center text-sm text-[#94A3B8]">
            {message}
        </div>
    );
}

function MiniMetric({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-[#334155] bg-[#111827]/70 p-4">
            <p className="text-xs text-[#64748B]">{label}</p>

            <p className="mt-2 text-lg font-semibold text-white">
                {value}
            </p>
        </div>
    );
}