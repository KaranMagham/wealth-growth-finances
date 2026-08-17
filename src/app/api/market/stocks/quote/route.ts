import { NextRequest, NextResponse } from "next/server";

const MARKET_DATA_API_KEY =
  process.env.MARKET_DATA_API_KEY;

export async function GET(request: NextRequest) {
  try {
    if (!MARKET_DATA_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Market data API key is not configured",
        },
        { status: 500 }
      );
    }

    const symbol = request.nextUrl.searchParams
      .get("symbol")
      ?.trim()
      .toUpperCase();

    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock symbol is required",
        },
        { status: 400 }
      );
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
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Market data provider request failed",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.Note) {
      return NextResponse.json(
        {
          success: false,
          message: "Market data API rate limit reached",
        },
        { status: 429 }
      );
    }

    if (data["Error Message"]) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or unsupported stock symbol",
        },
        { status: 400 }
      );
    }

    const quote = data["Global Quote"];

    if (!quote || !quote["05. price"]) {
      return NextResponse.json(
        {
          success: false,
          message: "No quote found for this symbol",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quote: {
        symbol: quote["01. symbol"],
        price: Number(quote["05. price"]),
        previousClose: Number(quote["08. previous close"]),
        change: Number(quote["09. change"]),
        changePercent: quote["10. change percent"],
        latestTradingDay: quote["07. latest trading day"],
        currency: "USD",
      },
    });
  } catch (error) {
    console.error("Stock quote error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load stock quote",
      },
      { status: 500 }
    );
  }
}