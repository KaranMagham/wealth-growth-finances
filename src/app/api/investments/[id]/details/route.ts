import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";
import InvestmentTransaction from "@/models/InvestmentTransaction";
import { getInvestmentStatus } from "@/lib/investmentCalculations";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    await connectDB();

    const investment = await Investment.findOne({
      _id: id,
      userId,
    }).lean();

    if (!investment) {
      return NextResponse.json(
        {
          success: false,
          message: "Investment not found",
        },
        { status: 404 }
      );
    }

    const transactions = await InvestmentTransaction.find({
      investmentId: investment._id,
      userId,
    })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const status = getInvestmentStatus(
      Number(investment.profitLoss || 0)
    );

    return NextResponse.json({
      success: true,
      investment,
      status,
      transactions,
    });
  } catch (error) {
    console.error("GET investment details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load investment details",
      },
      { status: 500 }
    );
  }
}