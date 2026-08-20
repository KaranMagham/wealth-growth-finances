import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const COINGECKO_API_URL =
  "https://api.coingecko.com/api/v3/simple/price";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(
      request.url
    );

    const coinId = searchParams
      .get("coinId")
      ?.trim()
      .toLowerCase();

    if (!coinId) {
      return NextResponse.json(
        {
          success: false,
          message: "Crypto coin ID is required",
        },
        { status: 400 }
      );
    }

    const providerUrl = new URL(
      COINGECKO_API_URL
    );

    providerUrl.searchParams.set("ids", coinId);
    providerUrl.searchParams.set(
      "vs_currencies",
      "inr"
    );

    const response = await fetch(
      providerUrl.toString(),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Crypto provider request failed",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const cryptoData = data?.[coinId];
    const price = Number(cryptoData?.inr);

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Crypto price was not available for this coin",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quote: {
        price,
        currency: "INR",
        unit: "coin",
        coinId,
      },
    });
  } catch (error) {
    console.error("Crypto quote error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch crypto price",
      },
      { status: 500 }
    );
  }
}