import { NextRequest, NextResponse } from "next/server";

const GOLD_PRICE_API_URL =
  process.env.GOLD_PRICE_API_URL ||
  "https://api.goldprice.dev/v1/carat?currency=INR";

const SUPPORTED_PURITIES = ["18K", "22K", "24K"] as const;

type GoldPurity = (typeof SUPPORTED_PURITIES)[number];

interface GoldPriceResponse {
  currency?: string;
  timestamp?: string;
  price_gram_24k?: number | string;
  price_gram_22k?: number | string;
  price_gram_18k?: number | string;
}

export async function GET(request: NextRequest) {
  try {
    const purityParam = request.nextUrl.searchParams
      .get("purity")
      ?.trim()
      .toUpperCase();

    if (
      !purityParam ||
      !SUPPORTED_PURITIES.includes(
        purityParam as GoldPurity
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Purity must be 18K, 22K, or 24K",
        },
        { status: 400 }
      );
    }

    const purity = purityParam as GoldPurity;

    const response = await fetch(GOLD_PRICE_API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 900,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Gold price provider request failed",
        },
        { status: 502 }
      );
    }

    const data: GoldPriceResponse =
      await response.json();

    const priceField: Record<
      GoldPurity,
      keyof GoldPriceResponse
    > = {
      "18K": "price_gram_18k",
      "22K": "price_gram_22k",
      "24K": "price_gram_24k",
    };

    const rawPrice = data[priceField[purity]];
    const pricePerGram = Number(rawPrice);

    if (
      !Number.isFinite(pricePerGram) ||
      pricePerGram <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Gold provider returned an invalid price",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      quote: {
        purity,
        pricePerGram,
        currency: data.currency || "INR",
        unit: "gram",
        priceUpdatedAt:
          data.timestamp || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Gold quote error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load gold price",
      },
      { status: 500 }
    );
  }
}