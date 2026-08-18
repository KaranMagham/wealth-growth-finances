import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";
import { calculateInvestmentValues } from "@/lib/investmentCalculations";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const GOLD_PRICE_API_URL =
  process.env.GOLD_PRICE_API_URL ||
  "https://api.goldprice.dev/v1/carat?currency=INR";

const MARKET_DATA_API_KEY =
  process.env.MARKET_DATA_API_KEY;

const GOLD_PRICE_FIELDS = {
  "18K": "price_gram_18k",
  "22K": "price_gram_22k",
  "24K": "price_gram_24k",
} as const;

type GoldPurity = keyof typeof GOLD_PRICE_FIELDS;

async function getUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

async function fetchStockPrice(symbol: string) {
  if (!MARKET_DATA_API_KEY) {
    throw new Error("Market data API key is not configured");
  }

  const providerUrl = new URL(
    "https://www.alphavantage.co/query"
  );

  providerUrl.searchParams.set(
    "function",
    "GLOBAL_QUOTE"
  );
  providerUrl.searchParams.set("symbol", symbol);
  providerUrl.searchParams.set(
    "apikey",
    MARKET_DATA_API_KEY
  );

  const response = await fetch(providerUrl.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Stock provider request failed");
  }

  const data = await response.json();

  if (data.Note) {
    throw new Error("Stock provider rate limit reached");
  }

  if (data["Error Message"]) {
    throw new Error("Invalid stock symbol");
  }

  const price = Number(data["Global Quote"]?.["05. price"]);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Stock price was not available");
  }

  return {
    price,
    currency: "USD",
  };
}

async function fetchMutualFundPrice(
  schemeCode: string
) {
  const providerUrl = `https://api.mfapi.in/mf/${encodeURIComponent(
    schemeCode
  )}/latest`;

  const response = await fetch(providerUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      "Mutual fund provider request failed"
    );
  }

  const data = await response.json();
  const price = Number(data.data?.[0]?.nav);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Mutual fund NAV was not available");
  }

  return {
    price,
    currency: "INR",
    navDate: data.data?.[0]?.date || null,
  };
}

async function fetchGoldPrice(purity: string) {
  if (!(purity in GOLD_PRICE_FIELDS)) {
    throw new Error("Invalid gold purity");
  }

  const response = await fetch(GOLD_PRICE_API_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Gold provider request failed");
  }

  const data = await response.json();

  const field =
    GOLD_PRICE_FIELDS[purity as GoldPurity];

  const price = Number(data[field]);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Gold price was not available");
  }

  return {
    price,
    currency: "INR",
    unit: "gram",
  };
}

export async function POST(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    await connectDB();

    const investment = await Investment.findOne({
      _id: id,
      userId,
    });

    if (!investment) {
      return NextResponse.json(
        {
          success: false,
          message: "Investment not found",
        },
        { status: 404 }
      );
    }

    let quote: {
      price: number;
      currency: string;
      unit?: string;
      navDate?: string | null;
    };

    if (investment.type === "Stocks") {
      if (!investment.symbol) {
        return NextResponse.json(
          {
            success: false,
            message: "Stock symbol is missing",
          },
          { status: 400 }
        );
      }

      quote = await fetchStockPrice(
        investment.symbol
      );
    } else if (investment.type === "Mutual Funds") {
      if (!investment.schemeCode) {
        return NextResponse.json(
          {
            success: false,
            message: "Mutual fund scheme code is missing",
          },
          { status: 400 }
        );
      }

      quote = await fetchMutualFundPrice(
        investment.schemeCode
      );
    } else if (investment.type === "Gold") {
      if (!investment.goldPurity) {
        return NextResponse.json(
          {
            success: false,
            message: "Gold purity is missing",
          },
          { status: 400 }
        );
      }

      quote = await fetchGoldPrice(
        investment.goldPurity
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message:
            "Automatic price refresh is not supported for this investment type",
        },
        { status: 400 }
      );
    }

    const calculations = calculateInvestmentValues({
      quantity: investment.quantity,
      purchasePrice: investment.averageBuyPrice,
      currentPrice: quote.price,
    });

    investment.currentPrice = quote.price;
    investment.totalInvested =
      calculations.totalInvested;
    investment.currentValue =
      calculations.currentValue;
    investment.profitLoss = calculations.profitLoss;
    investment.returnPercentage =
      calculations.returnPercentage;
    investment.priceSource = "MARKET_API";
    investment.priceUpdatedAt = new Date();

    await investment.save();

    return NextResponse.json({
      success: true,
      investment,
      quote,
    });
  } catch (error) {
    console.error("Refresh investment price error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to refresh investment price",
      },
      { status: 502 }
    );
  }
}