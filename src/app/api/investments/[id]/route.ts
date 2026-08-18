import { NextResponse } from "next/server";
import { headers } from "next/headers";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Investment from "@/models/Investment";
import { calculateInvestmentValues } from "@/lib/investmentCalculations";

const INVESTMENT_TYPES = [
  "Stocks",
  "Mutual Funds",
  "ETF",
  "Bonds",
  "Fixed Deposit",
  "Crypto",
  "Gold",
  "Other",
] as const;

type InvestmentType =
  (typeof INVESTMENT_TYPES)[number];

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

export async function PATCH(
  request: Request,
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid investment ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const type = body.type as InvestmentType;
    const symbol = String(body.symbol ?? "")
      .trim()
      .toUpperCase();
    const schemeCode = String(body.schemeCode ?? "").trim();
    const goldPurity = String(body.goldPurity ?? "")
      .trim()
      .toUpperCase();

    const quantity = Number(body.quantity);
    const buyPrice = Number(body.buyPrice);
    const currentPrice = Number(body.currentPrice);
    const purchaseDate = String(body.purchaseDate ?? "");
    const notes = String(body.notes ?? "").trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Investment name is required",
        },
        { status: 400 }
      );
    }

    if (!INVESTMENT_TYPES.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid investment type",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be greater than zero",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(buyPrice) || buyPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Buy price must be greater than zero",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(currentPrice) ||
      currentPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Current price cannot be negative",
        },
        { status: 400 }
      );
    }

    if (type === "Stocks" && !symbol) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock symbol is required",
        },
        { status: 400 }
      );
    }

    if (
      type === "Mutual Funds" &&
      !/^\d+$/.test(schemeCode)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid scheme code is required",
        },
        { status: 400 }
      );
    }

    if (
      type === "Gold" &&
      !["18K", "22K", "24K"].includes(goldPurity)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid gold purity is required",
        },
        { status: 400 }
      );
    }

    const parsedPurchaseDate = new Date(purchaseDate);

    if (
      !purchaseDate ||
      Number.isNaN(parsedPurchaseDate.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid purchase date is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const investment = await Investment.findOne({
      _id: id,
      userId,
    });

    if (!investment) {
      return NextResponse.json(
        {
          success: false,
          message: "Investment not found",
        },
        { status: 404 }
      );
    }

    const calculations = calculateInvestmentValues({
      quantity,
      purchasePrice: buyPrice,
      currentPrice,
    });

    investment.name = name;
    investment.type = type;
    investment.symbol =
      type === "Stocks" ? symbol : undefined;
    investment.schemeCode =
      type === "Mutual Funds"
        ? schemeCode
        : undefined;
    investment.goldPurity =
      type === "Gold"
        ? (goldPurity as "18K" | "22K" | "24K")
        : undefined;
    investment.quantity = quantity;
    investment.averageBuyPrice = buyPrice;
    investment.currentPrice = currentPrice;
    investment.totalInvested =
      calculations.totalInvested;
    investment.currentValue =
      calculations.currentValue;
    investment.profitLoss = calculations.profitLoss;
    investment.returnPercentage =
      calculations.returnPercentage;
    investment.purchaseDate = parsedPurchaseDate;
    investment.notes = notes || undefined;
    investment.priceSource = "MANUAL";
    investment.priceUpdatedAt = new Date();

    await investment.save();

    return NextResponse.json({
      success: true,
      investment,
    });
  } catch (error) {
    console.error("Update investment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update investment",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const userId = await getUserId();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid investment ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await Investment.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Investment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Investment deleted successfully",
    });
  } catch (error) {
    console.error("Delete investment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete investment",
      },
      { status: 500 }
    );
  }
}