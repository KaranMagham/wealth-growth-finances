import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    schemeCode: string;
  }>;
};

interface MfApiEntry {
  date?: string;
  nav?: string;
}

interface MfApiResponse {
  meta?: {
    fund_house?: string;
    scheme_type?: string;
    scheme_category?: string;
    scheme_code?: number;
    scheme_name?: string;
  };
  data?: MfApiEntry[];
  status?: string;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { schemeCode } = await context.params;

    const normalizedSchemeCode = schemeCode
      .trim()
      .replace(/\D/g, "");

    if (!normalizedSchemeCode) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid mutual fund scheme code is required",
        },
        { status: 400 }
      );
    }

    const providerUrl = `https://api.mfapi.in/mf/${encodeURIComponent(
      normalizedSchemeCode
    )}/latest`;

    const response = await fetch(providerUrl, {
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
          message: "Mutual fund provider request failed",
        },
        { status: 502 }
      );
    }

    const data: MfApiResponse = await response.json();

    if (
      !data.meta ||
      !Array.isArray(data.data) ||
      data.data.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Mutual fund scheme not found",
        },
        { status: 404 }
      );
    }

    const latestEntry = data.data[0];
    const nav = Number(latestEntry.nav);

    if (!Number.isFinite(nav) || nav < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Mutual fund provider returned an invalid NAV",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      quote: {
        schemeCode: Number(
          data.meta.scheme_code || normalizedSchemeCode
        ),
        schemeName: data.meta.scheme_name || null,
        fundHouse: data.meta.fund_house || null,
        schemeType: data.meta.scheme_type || null,
        schemeCategory: data.meta.scheme_category || null,
        nav,
        navDate: latestEntry.date || null,
        currency: "INR",
        priceUpdatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Mutual fund quote error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load mutual fund NAV",
      },
      { status: 500 }
    );
  }
}