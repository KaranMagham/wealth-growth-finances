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

export async function GET() {
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
    })
      .select(
        "quantity averageBuyPrice currentPrice"
      )
      .lean();

    let totalInvested = 0;
    let currentValue = 0;

    for (const investment of investments) {
      const calculation = calculateInvestmentValues({
        quantity: Number(investment.quantity),
        purchasePrice: Number(investment.averageBuyPrice),
        currentPrice: Number(investment.currentPrice),
      });

      totalInvested += calculation.totalInvested;
      currentValue += calculation.currentValue;
    }

    const profitLoss = currentValue - totalInvested;

    const returnPercentage =
      totalInvested > 0
        ? (profitLoss / totalInvested) * 100
        : 0;

    return NextResponse.json({
      success: true,
      summary: {
        investmentCount: investments.length,
        totalInvested,
        currentValue,
        profitLoss,
        returnPercentage,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/investments/summary error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load investment summary",
      },
      { status: 500 }
    );
  }
}