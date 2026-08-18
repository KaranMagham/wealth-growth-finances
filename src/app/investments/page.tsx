"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
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
type GoldPurity = "18K" | "22K" | "24K";

interface InvestmentRecord {
  _id: string;
  name: string;
  type: InvestmentType;
  symbol?: string;
  schemeCode?: string;
  goldPurity?: GoldPurity;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  totalInvested: number;
  profitLoss: number;
  returnPercentage: number;
  purchaseDate: string;
  notes?: string;
  createdAt?: string;
  priceSource?: "MANUAL" | "MARKET_API";
  priceUpdatedAt?: string;
}

interface InvestmentsResponse {
  success: boolean;
  investments?: InvestmentRecord[];
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

interface InvestmentForm {
  name: string;
  type: InvestmentType;
  symbol: string;
  schemeCode: string;
  goldPurity: GoldPurity;
  quantity: string;
  buyPrice: string;
  currentPrice: string;
  purchaseDate: string;
  notes: string;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function createInitialForm(): InvestmentForm {
  return {
    name: "",
    type: "Stocks",
    symbol: "",
    schemeCode: "",
    goldPurity: "24K",
    quantity: "",
    buyPrice: "",
    currentPrice: "",
    purchaseDate: getToday(),
    notes: "",
  };
}

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getIdentifier(investment: InvestmentRecord) {
  if (investment.type === "Stocks") {
    return investment.symbol || "No symbol";
  }

  if (investment.type === "Mutual Funds") {
    return investment.schemeCode || "No scheme code";
  }

  if (investment.type === "Gold") {
    return investment.goldPurity || "No purity";
  }

  return "Manual price";
}

export default function InvestmentsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [investments, setInvestments] = useState<
    InvestmentRecord[]
  >([]);

  const [form, setForm] = useState<InvestmentForm>(
    createInitialForm()
  );

  const [editingInvestment, setEditingInvestment] =
    useState<InvestmentRecord | null>(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [message, setMessage] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] =
    useState(false);
  const [isLoadingInvestments, setIsLoadingInvestments] =
    useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [serverSummary, setServerSummary] =
    useState<InvestmentSummary | null>(null);

  const [allocation, setAllocation] = useState<
    AllocationItem[]
  >([]);

  const updateForm = <K extends keyof InvestmentForm>(
    field: K,
    value: InvestmentForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const fetchInvestments = useCallback(async () => {
    try {
      setIsLoadingInvestments(true);

      const response = await fetch("/api/investments", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data =
        (await response.json()) as InvestmentsResponse;

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Unable to load investments."
        );
        return;
      }

      setInvestments(data.investments || []);
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

      if (response.ok && data.success) {
        setServerSummary(data.summary);
      }
    } catch (error) {
      console.error("Fetch summary error:", error);
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

      if (response.ok && data.success) {
        setAllocation(data.allocation || []);
      }
    } catch (error) {
      console.error("Fetch allocation error:", error);
    }
  }, []);

  const reloadInvestmentData = useCallback(async () => {
    await Promise.all([
      fetchInvestments(),
      fetchSummary(),
      fetchAllocation(),
    ]);
  }, [
    fetchInvestments,
    fetchSummary,
    fetchAllocation,
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
      void reloadInvestmentData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [status, router, reloadInvestmentData]);

  async function readJson<T>(response: Response): Promise<T> {
  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();

    throw new Error(
      `Expected JSON but received ${response.status}.`
    );
  }

  return response.json() as Promise<T>;
}

  const localSummary = useMemo(() => {
    const summary = investments.reduce(
      (result, investment) => ({
        investmentCount:
          result.investmentCount + 1,
        totalInvested:
          result.totalInvested +
          investment.totalInvested,
        currentValue:
          result.currentValue +
          investment.currentValue,
        profitLoss:
          result.profitLoss + investment.profitLoss,
        returnPercentage: 0,
      }),
      {
        investmentCount: 0,
        totalInvested: 0,
        currentValue: 0,
        profitLoss: 0,
        returnPercentage: 0,
      }
    );

    return {
      ...summary,
      returnPercentage:
        summary.totalInvested > 0
          ? (summary.profitLoss /
              summary.totalInvested) *
            100
          : 0,
    };
  }, [investments]);

  const displayedSummary =
    serverSummary || localSummary;

  const filteredInvestments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...investments]
      .filter((investment) => {
        const searchableText = [
          investment.name,
          investment.type,
          investment.symbol,
          investment.schemeCode,
          investment.goldPurity,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !term || searchableText.includes(term);

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
          return b.currentValue - a.currentValue;
        }

        return (
          new Date(
            b.createdAt || b.purchaseDate
          ).getTime() -
          new Date(
            a.createdAt || a.purchaseDate
          ).getTime()
        );
      });
  }, [investments, search, filterType, sortBy]);

  const fetchStockQuote = useCallback(async () => {
    const symbol = form.symbol.trim().toUpperCase();

    if (!symbol) {
      setQuoteMessage("Enter a stock symbol first.");
      return;
    }

    try {
      setIsLoadingQuote(true);
      setQuoteMessage("");

      const response = await fetch(
        `/api/market/stocks/quote?symbol=${encodeURIComponent(
          symbol
        )}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setQuoteMessage(
          data.message || "Unable to load stock price."
        );
        return;
      }

      const price = Number(data.quote?.price);

      if (!Number.isFinite(price) || price <= 0) {
        setQuoteMessage("Invalid stock price received.");
        return;
      }

      setForm((current) => ({
        ...current,
        symbol,
        currentPrice: price.toFixed(2),
      }));

      setQuoteMessage(
        `Stock price updated: ${formatCurrency(price)}`
      );
    } catch (error) {
      console.error("Stock quote error:", error);
      setQuoteMessage("Unable to fetch stock price.");
    } finally {
      setIsLoadingQuote(false);
    }
  }, [form.symbol]);

  const fetchGoldQuote = useCallback(async () => {
    if (form.type !== "Gold") {
      return;
    }

    try {
      setIsLoadingQuote(true);
      setQuoteMessage("");

      const response = await fetch(
        `/api/market/gold/quote?purity=${encodeURIComponent(
          form.goldPurity
        )}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await readJson<{
  success: boolean;
  message?: string;
  quote?: {
    price?: number;
    purity?: string;
    currency?: string;
    unit?: string;
  };
}>(response);

      if (!response.ok || !data.success) {
        setQuoteMessage(
          data.message || "Unable to load gold price."
        );
        return;
      }

      const price = Number(data.quote?.price);

      if (!Number.isFinite(price) || price <= 0) {
        setQuoteMessage("Invalid gold price received.");
        return;
      }

      setForm((current) => ({
        ...current,
        currentPrice: price.toFixed(2),
      }));

      setQuoteMessage(
        `${form.goldPurity} price updated: ${formatCurrency(
          price
        )} per gram`
      );
    } catch (error) {
      console.error("Gold quote error:", error);
      setQuoteMessage("Unable to fetch gold price.");
    } finally {
      setIsLoadingQuote(false);
    }
  }, [form.type, form.goldPurity]);

  const handleTypeChange = (
    type: InvestmentType
  ) => {
    setForm((current) => ({
      ...current,
      type,
      symbol: "",
      schemeCode: "",
      goldPurity: "24K",
      currentPrice: "",
    }));

    setQuoteMessage("");
  };

  const startEditing = (
    investment: InvestmentRecord
  ) => {
    setEditingInvestment(investment);

    setForm({
      name: investment.name,
      type: investment.type,
      symbol: investment.symbol || "",
      schemeCode: investment.schemeCode || "",
      goldPurity: investment.goldPurity || "24K",
      quantity: String(investment.quantity),
      buyPrice: String(investment.averageBuyPrice),
      currentPrice: String(investment.currentPrice),
      purchaseDate: investment.purchaseDate
        ? investment.purchaseDate.slice(0, 10)
        : getToday(),
      notes: investment.notes || "",
    });

    setMessage("");
    setQuoteMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEditing = () => {
    setEditingInvestment(null);
    setForm(createInitialForm());
    setQuoteMessage("");
    setMessage("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setMessage("");

    const quantity = Number(form.quantity);
    const buyPrice = Number(form.buyPrice);

    const currentPrice =
      form.currentPrice.trim() === ""
        ? buyPrice
        : Number(form.currentPrice);

    if (!form.name.trim()) {
      setMessage("Enter an investment name.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setMessage("Enter a quantity greater than zero.");
      return;
    }

    if (!Number.isFinite(buyPrice) || buyPrice <= 0) {
      setMessage("Enter a buy price greater than zero.");
      return;
    }

    if (
      !Number.isFinite(currentPrice) ||
      currentPrice < 0
    ) {
      setMessage("Enter a valid current price.");
      return;
    }

    if (
      form.type === "Stocks" &&
      !form.symbol.trim()
    ) {
      setMessage("Enter a stock symbol.");
      return;
    }

    if (
      form.type === "Mutual Funds" &&
      !/^\d+$/.test(form.schemeCode.trim())
    ) {
      setMessage("Enter a valid scheme code.");
      return;
    }

    if (
      form.type === "Gold" &&
      !["18K", "22K", "24K"].includes(
        form.goldPurity
      )
    ) {
      setMessage("Select a valid gold purity.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name: form.name.trim(),
        type: form.type,
        symbol:
          form.type === "Stocks"
            ? form.symbol.trim().toUpperCase()
            : undefined,
        schemeCode:
          form.type === "Mutual Funds"
            ? form.schemeCode.trim()
            : undefined,
        goldPurity:
          form.type === "Gold"
            ? form.goldPurity
            : undefined,
        quantity,
        buyPrice,
        currentPrice,
        purchaseDate: form.purchaseDate,
        notes: form.notes.trim(),
      };

      const url = editingInvestment
        ? `/api/investments/${editingInvestment._id}`
        : "/api/investments";

      const response = await fetch(url, {
        method: editingInvestment ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Unable to save investment."
        );
        return;
      }

      const wasEditing = Boolean(editingInvestment);

      setEditingInvestment(null);
      setForm(createInitialForm());
      setQuoteMessage("");

      setMessage(
        wasEditing
          ? "Investment updated successfully."
          : "Investment added successfully."
      );

      await reloadInvestmentData();
    } catch (error) {
      console.error("Save investment error:", error);
      setMessage("Unable to save investment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (
    investment: InvestmentRecord
  ) => {
    const confirmed = window.confirm(
      `Delete "${investment.name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");

      const response = await fetch(
        `/api/investments/${investment._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Unable to delete investment."
        );
        return;
      }

      if (
        editingInvestment?._id === investment._id
      ) {
        cancelEditing();
      }

      setMessage("Investment deleted successfully.");
      await reloadInvestmentData();
    } catch (error) {
      console.error("Delete investment error:", error);
      setMessage("Unable to delete investment.");
    }
  };

  const handleRefreshAll = async () => {
    try {
      setIsRefreshing(true);
      setMessage("");

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

      await reloadInvestmentData();

      setMessage(
        data.failedCount > 0
          ? `${data.updatedCount} investment(s) refreshed. ${data.failedCount} failed.`
          : `${data.updatedCount} investment(s) refreshed successfully.`
      );
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
              className="inline-flex items-center gap-2 text-sm text-[#10B981] hover:text-[#34D399]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#10B981]/40 px-4 py-2.5 text-sm font-semibold text-[#D4F2D3] hover:bg-[#10B981]/10 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />

                {isRefreshing
                  ? "Refreshing..."
                  : "Refresh prices"}
              </button>
            </div>
          </header>

          {message && (
            <div className="mb-6 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-3 text-sm text-[#D4F2D3]">
              {message}
            </div>
          )}

          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total invested"
              value={formatCurrency(
                displayedSummary.totalInvested
              )}
              icon={
                <BriefcaseBusiness className="h-5 w-5" />
              }
            />

            <SummaryCard
              title="Current value"
              value={formatCurrency(
                displayedSummary.currentValue
              )}
              icon={
                <ChartNoAxesCombined className="h-5 w-5" />
              }
            />

            <SummaryCard
              title="Profit / loss"
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
              title="Overall return"
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

          <section className="mb-6 rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 sm:p-6">
            <h2 className="text-xl font-semibold">
              Asset allocation
            </h2>

            <p className="mt-1 text-sm text-[#94A3B8]">
              See how your portfolio is distributed.
            </p>

            {allocation.length === 0 ? (
              <p className="mt-5 text-sm text-[#94A3B8]">
                No allocation data available yet.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {allocation.map((item) => (
                  <div key={item.type}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>{item.type}</span>
                      <span className="text-[#94A3B8]">
                        {item.percentage.toFixed(2)}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#1E293B]">
                      <div
                        className="h-full rounded-full bg-[#10B981]"
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

          <section className="mb-6 rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#94A3B8]">
                <Plus className="h-4 w-4 text-[#10B981]" />

                {editingInvestment
                  ? "Edit investment"
                  : "Add investment"}
              </div>

              {editingInvestment && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="inline-flex items-center gap-1 text-sm text-[#94A3B8] hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-5"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FormInput
                  label="Investment name"
                  value={form.name}
                  onChange={(value) =>
                    updateForm("name", value)
                  }
                  placeholder="Reliance Industries"
                  required
                />

                <FormSelect
                  label="Investment type"
                  value={form.type}
                  onChange={(value) =>
                    handleTypeChange(
                      value as InvestmentType
                    )
                  }
                  options={INVESTMENT_TYPES}
                />

                {form.type === "Stocks" && (
                  <IdentifierField
                    label="Stock symbol"
                    value={form.symbol}
                    placeholder="IBM"
                    buttonText={
                      isLoadingQuote
                        ? "Loading..."
                        : "Get price"
                    }
                    disabled={
                      isLoadingQuote ||
                      !form.symbol.trim()
                    }
                    onChange={(value) =>
                      updateForm(
                        "symbol",
                        value.toUpperCase()
                      )
                    }
                    onAction={() =>
                      void fetchStockQuote()
                    }
                    message={quoteMessage}
                  />
                )}

                {form.type === "Mutual Funds" && (
                  <FormInput
                    label="Scheme code"
                    value={form.schemeCode}
                    onChange={(value) =>
                      updateForm("schemeCode", value)
                    }
                    placeholder="125497"
                    inputMode="numeric"
                    required
                  />
                )}

                {form.type === "Gold" && (
                  <div className="text-sm text-[#E2E8F0]">
                    <span className="mb-2 block">
                      Gold purity
                    </span>

                    <div className="flex gap-2">
                      <select
                        value={form.goldPurity}
                        onChange={(event) => {
                          updateForm(
                            "goldPurity",
                            event.target.value as GoldPurity
                          );
                          setQuoteMessage("");
                        }}
                        className="min-w-0 flex-1 rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-white outline-none focus:border-[#10B981]"
                      >
                        <option value="18K">18K</option>
                        <option value="22K">22K</option>
                        <option value="24K">24K</option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          void fetchGoldQuote()
                        }
                        disabled={isLoadingQuote}
                        className="shrink-0 rounded-xl border border-[#10B981]/40 px-3 py-2 text-xs font-semibold text-[#D4F2D3] hover:bg-[#10B981]/10 disabled:opacity-50"
                      >
                        {isLoadingQuote
                          ? "Loading..."
                          : "Get price"}
                      </button>
                    </div>

                    {quoteMessage && (
                      <p className="mt-2 text-xs text-[#94A3B8]">
                        {quoteMessage}
                      </p>
                    )}
                  </div>
                )}

                <FormInput
                  label="Quantity"
                  type="number"
                  min="0"
                  step="0.000001"
                  value={form.quantity}
                  onChange={(value) =>
                    updateForm("quantity", value)
                  }
                  placeholder="10"
                  required
                />

                <FormInput
                  label="Buy price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.buyPrice}
                  onChange={(value) =>
                    updateForm("buyPrice", value)
                  }
                  placeholder="1400"
                  required
                />

                <FormInput
                  label="Current price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.currentPrice}
                  onChange={(value) =>
                    updateForm("currentPrice", value)
                  }
                  placeholder={
                    form.type === "Gold"
                      ? "Price per gram"
                      : "Optional; uses buy price"
                  }
                />

                <FormInput
                  label="Purchase date"
                  type="date"
                  value={form.purchaseDate}
                  onChange={(value) =>
                    updateForm("purchaseDate", value)
                  }
                  required
                />

                <FormInput
                  label="Notes"
                  value={form.notes}
                  onChange={(value) =>
                    updateForm("notes", value)
                  }
                  placeholder="Long-term investment"
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-[#10B981] px-5 py-2.5 font-semibold text-[#022C22] hover:bg-[#34D399] disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving..."
                    : editingInvestment
                      ? "Update investment"
                      : "Add investment"}
                </button>

                {editingInvestment && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-full border border-[#334155] px-5 py-2.5 text-sm font-semibold text-[#CBD5E1] hover:bg-[#111827]"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-[28px] border border-[#334155] bg-[#0F172A]/90 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Investment list
                </h2>

                <p className="mt-1 text-sm text-[#94A3B8]">
                  Search, filter, edit, or remove investments.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex items-center gap-2 rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-sm">
                  <Search className="h-4 w-4 text-[#10B981]" />

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
                  className="rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-sm"
                >
                  <option value="All">All types</option>

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
                  className="rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="name">Name</option>
                  <option value="value">
                    Current value
                  </option>
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
                    No investments found
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
                          Current value
                        </th>
                        <th className="px-4 py-3">
                          Profit/loss
                        </th>
                        <th className="px-4 py-3">
                          Updated
                        </th>
                        <th className="px-4 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredInvestments.map(
                        (investment) => (
                          <tr
                            key={investment._id}
                            className="border-t border-[#1F2937] bg-[#0F172A]/70"
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium">
                                {investment.name}
                              </div>

                              <div className="text-xs text-[#64748B]">
                                {getIdentifier(investment)}
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              {investment.type}
                            </td>

                            <td className="px-4 py-3">
                              {investment.quantity}
                            </td>

                            <td className="px-4 py-3">
                              {formatCurrency(
                                investment.totalInvested
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {formatCurrency(
                                investment.currentValue
                              )}
                            </td>

                            <td
                              className={`px-4 py-3 font-semibold ${
                                investment.profitLoss >= 0
                                  ? "text-[#10B981]"
                                  : "text-rose-400"
                              }`}
                            >
                              {investment.profitLoss >= 0
                                ? "+"
                                : ""}
                              {formatCurrency(
                                investment.profitLoss
                              )}
                            </td>

                            <td className="px-4 py-3 text-xs text-[#94A3B8]">
                              {investment.priceUpdatedAt
                                ? formatDate(
                                    investment.priceUpdatedAt
                                  )
                                : "Manual"}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEditing(
                                      investment
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#334155] px-3 py-1.5 text-xs font-semibold text-[#CBD5E1] hover:border-[#10B981] hover:text-[#10B981]"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleDelete(
                                      investment
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
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

        <span className="text-[#10B981]">{icon}</span>
      </div>

      <p
        className={`mt-4 text-2xl font-semibold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function IdentifierField({
  label,
  value,
  placeholder,
  buttonText,
  disabled,
  onChange,
  onAction,
  message,
}: {
  label: string;
  value: string;
  placeholder: string;
  buttonText: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onAction: () => void;
  message: string;
}) {
  return (
    <div className="text-sm text-[#E2E8F0]">
      <span className="mb-2 block">{label}</span>

      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAction();
            }
          }}
          placeholder={placeholder}
          required
          className="min-w-0 flex-1 rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 uppercase text-white outline-none focus:border-[#10B981]"
        />

        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className="shrink-0 rounded-xl border border-[#10B981]/40 px-3 py-2 text-xs font-semibold text-[#D4F2D3] hover:bg-[#10B981]/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {buttonText}
        </button>
      </div>

      {message && (
        <p className="mt-2 text-xs text-[#94A3B8]">
          {message}
        </p>
      )}
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
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
  inputMode?: "text" | "numeric" | "decimal";
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
        inputMode={inputMode}
        className="w-full rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-white outline-none transition focus:border-[#10B981]"
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
        className="w-full rounded-xl border border-[#334155] bg-[#111827] px-3 py-2 text-white outline-none focus:border-[#10B981]"
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