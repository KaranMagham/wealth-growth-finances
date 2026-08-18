import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const GOLD_PRICE_API_URL =
  "https://api.goldprice.dev/v1/carat?currency=INR";

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

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const purity = searchParams
      .get("purity")
      ?.toUpperCase() as GoldPurity | undefined;

    if (!purity || !(purity in GOLD_PRICE_FIELDS)) {
      return NextResponse.json(
        {
          success: false,
          message: "Purity must be 18K, 22K, or 24K",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      GOLD_PRICE_API_URL,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();

      console.error(
        "Gold provider returned non-JSON:",
        text.slice(0, 300)
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gold provider returned an invalid response",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Gold provider request failed",
        },
        { status: 502 }
      );
    }

    const field = GOLD_PRICE_FIELDS[purity];
    const price = Number(data[field]);

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Gold price was not available",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      quote: {
        price,
        purity,
        currency: "INR",
        unit: "gram",
        timestamp: data.timestamp || null,
      },
    });
  } catch (error) {
    console.error("Gold quote route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch gold price",
      },
      { status: 500 }
    );
  }
}