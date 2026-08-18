import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";

async function getUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

type RefreshResult = {
  success: boolean;
  investment?: unknown;
  quote?: unknown;
  message?: string;
};

export async function POST(request: Request) {
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

    await connectDB();

    const investments = await Investment.find({
      userId,
      $or: [
        {
          type: "Stocks",
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
      ],
    });

    if (investments.length === 0) {
      return NextResponse.json({
        success: true,
        updatedCount: 0,
        failedCount: 0,
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
              cookie: request.headers.get("cookie") ?? "",
            },
            cache: "no-store",
          }
        );

        const refreshData =
          (await refreshResponse.json()) as RefreshResult;

        if (!refreshResponse.ok || !refreshData.success) {
          failures.push({
            investmentId: investment._id.toString(),
            name: investment.name,
            type: investment.type,
            symbol: investment.symbol,
            schemeCode: investment.schemeCode,
            goldPurity: investment.goldPurity,
            message:
              refreshData.message ||
              "Unable to refresh investment",
          });

          continue;
        }

        updatedInvestments.push(
          refreshData.investment
        );
      } catch (error) {
        console.error(
          `Failed to refresh investment ${investment._id}:`,
          error
        );

        failures.push({
          investmentId: investment._id.toString(),
          name: investment.name,
          type: investment.type,
          symbol: investment.symbol,
          schemeCode: investment.schemeCode,
          goldPurity: investment.goldPurity,
          message: "Unable to refresh this investment",
        });
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedInvestments.length,
      failedCount: failures.length,
      investments: updatedInvestments,
      failures,
    });
  } catch (error) {
    console.error("Refresh all investments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to refresh investments",
      },
      { status: 500 }
    );
  }
}