import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";
import { calculateInvestmentValues } from "@/lib/investmentCalculations";

async function getUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

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
      type: "Stocks",
      symbol: {
        $exists: true,
        $nin: ["", null],
      },
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
    const updatedInvestments = [];
    const failures = [];

    for (const investment of investments) {
      try {
        const quoteUrl = new URL(
          "/api/market/stocks/quote",
          origin
        );

        quoteUrl.searchParams.set(
          "symbol",
          investment.symbol!
        );

        const quoteResponse = await fetch(
          quoteUrl.toString(),
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const quoteData = await quoteResponse.json();

        if (!quoteResponse.ok || !quoteData.success) {
          failures.push({
            investmentId: investment._id.toString(),
            symbol: investment.symbol,
            message:
              quoteData.message ||
              "Unable to load quote",
          });

          continue;
        }

        const currentPrice = Number(
          quoteData.quote?.price
        );

        if (!Number.isFinite(currentPrice) || currentPrice < 0) {
          failures.push({
            investmentId: investment._id.toString(),
            symbol: investment.symbol,
            message: "Invalid market price",
          });

          continue;
        }

        const calculations = calculateInvestmentValues({
          quantity: investment.quantity,
          purchasePrice: investment.averageBuyPrice,
          currentPrice,
        });

        investment.currentPrice = currentPrice;
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

        updatedInvestments.push(investment);
      } catch (error) {
        console.error(
          `Failed to refresh ${investment.symbol}:`,
          error
        );

        failures.push({
          investmentId: investment._id.toString(),
          symbol: investment.symbol,
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