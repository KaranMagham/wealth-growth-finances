import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";

type RefreshResult = {
  success: boolean;
  investment?: unknown;
  quote?: unknown;
  message?: string;
};

async function getUserId(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user?.id ?? null;
}

async function readRefreshResponse(
  response: Response
): Promise<RefreshResult> {
  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return {
      success: false,
      message: `Refresh endpoint returned HTTP ${response.status}.`,
    };
  }

  return response.json() as Promise<RefreshResult>;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const cookieHeader =
      request.headers.get("cookie") ?? "";

    if (!cookieHeader) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your session cookie was not available. Please log in again.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const investments = await Investment.find({
      userId,
      $or: [
        {
          type: {
            $in: ["Stocks", "ETF"],
          },
          symbol: {
            $exists: true,
            $nin: ["", null],
          },
        },
        {
          type: "Mutual Funds",
          schemeCode: {
            $exists: true,
            $nin: ["", null],
          },
        },
        {
          type: "Gold",
          goldPurity: {
            $exists: true,
            $nin: ["", null],
          },
        },
        {
          type: "Crypto",
          cryptoId: {
            $exists: true,
            $nin: ["", null],
          },
        },
      ],
    });

    if (investments.length === 0) {
      return NextResponse.json({
        success: true,
        updatedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        investments: [],
        failures: [],
      });
    }

    const origin = new URL(request.url).origin;

    const updatedInvestments: unknown[] = [];
    const failures: unknown[] = [];

    for (const investment of investments) {
      try {
        const refreshUrl = new URL(
          `/api/investments/${investment._id.toString()}/refresh-price`,
          origin
        );

        const refreshResponse = await fetch(
          refreshUrl.toString(),
          {
            method: "POST",
            headers: {
              cookie: cookieHeader,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const refreshData =
          await readRefreshResponse(refreshResponse);

        if (!refreshResponse.ok || !refreshData.success) {
          failures.push({
            investmentId: investment._id.toString(),
            name: investment.name,
            type: investment.type,
            symbol: investment.symbol || null,
            schemeCode: investment.schemeCode || null,
            goldPurity: investment.goldPurity || null,
            cryptoId: investment.cryptoId || null,
            message:
              refreshData.message ||
              "Unable to refresh investment price.",
          });

          continue;
        }

        updatedInvestments.push(
          refreshData.investment
        );
      } catch (error) {
        console.error(
          `Failed to refresh investment ${investment._id.toString()}:`,
          error
        );

        failures.push({
          investmentId: investment._id.toString(),
          name: investment.name,
          type: investment.type,
          symbol: investment.symbol || null,
          schemeCode: investment.schemeCode || null,
          goldPurity: investment.goldPurity || null,
          cryptoId: investment.cryptoId || null,
          message:
            error instanceof Error
              ? error.message
              : "Unable to refresh this investment.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedInvestments.length,
      failedCount: failures.length,
      skippedCount: 0,
      investments: updatedInvestments,
      failures,
    });
  } catch (error) {
    console.error("Refresh all investments error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to refresh investments.",
      },
      { status: 500 }
    );
  }
}