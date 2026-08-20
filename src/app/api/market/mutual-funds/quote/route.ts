import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

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

    const schemeCode = searchParams
      .get("schemeCode")
      ?.trim();

    if (!schemeCode || !/^\d+$/.test(schemeCode)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid numeric scheme code is required",
        },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        {
          success: false,
          message:
            "Mutual fund provider request failed",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const latestNav = data.data?.[0];

    const nav = Number(latestNav?.nav);

    if (!Number.isFinite(nav) || nav <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NAV was not available for this scheme",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quote: {
        price: nav,
        nav,
        schemeCode,
        date: latestNav?.date || null,
        currency: "INR",
        unit: "NAV",
        schemeName:
          data.meta?.scheme_name || null,
      },
    });
  } catch (error) {
    console.error(
      "Mutual fund quote error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch mutual fund NAV",
      },
      { status: 500 }
    );
  }
}