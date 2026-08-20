import { NextResponse } from "next/server";
import { headers } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";
import {
  calculateInvestmentValues
} from "@/lib/investmentCalculations";

type BondInterestFrequency =
  | "Monthly"
  | "Quarterly"
  | "Half-yearly"
  | "Yearly";

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

const VALID_BOND_FREQUENCIES = [
  "Monthly",
  "Quarterly",
  "Half-yearly",
  "Yearly",
] as const;

async function getUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

    const schemeCode = String(
      body.schemeCode ?? ""
    ).trim();

    const goldPurity = String(
      body.goldPurity ?? ""
    )
      .trim()
      .toUpperCase();

    const cryptoId = String(body.cryptoId ?? "")
      .trim()
      .toLowerCase();

    const cryptoSymbol = String(
      body.cryptoSymbol ?? ""
    )
      .trim()
      .toUpperCase();

    const bondFaceValue =
      body.bondFaceValue === undefined ||
        body.bondFaceValue === ""
        ? undefined
        : Number(body.bondFaceValue);

    const bondCouponRate =
      body.bondCouponRate === undefined ||
        body.bondCouponRate === ""
        ? undefined
        : Number(body.bondCouponRate);

    const bondMaturityDate = body.bondMaturityDate
      ? new Date(String(body.bondMaturityDate))
      : undefined;

    const bondInterestFrequency =
      body.bondInterestFrequency as
      | BondInterestFrequency
      | undefined;

    const quantity = Number(body.quantity);
    const buyPrice = Number(body.buyPrice);

    const currentPrice =
      body.currentPrice === undefined ||
        body.currentPrice === ""
        ? buyPrice
        : Number(body.currentPrice);

    const purchaseDate = String(
      body.purchaseDate ?? ""
    );

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

    if (
      (type === "Stocks" || type === "ETF") &&
      !symbol
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            type === "ETF"
              ? "ETF ticker is required"
              : "Stock symbol is required",
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
          message:
            "A valid mutual fund scheme code is required",
        },
        { status: 400 }
      );
    }

    if (
      type === "Gold" &&
      !["18K", "22K", "24K"].includes(
        goldPurity
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gold purity must be 18K, 22K, or 24K",
        },
        { status: 400 }
      );
    }

    if (type === "Crypto") {
      if (!cryptoId || !cryptoSymbol) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Crypto ID and symbol are required",
          },
          { status: 400 }
        );
      }
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

    const parsedPurchaseDate = new Date(
      purchaseDate
    );

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

    if (
      type !== "Bonds" &&
      (!Number.isFinite(currentPrice) ||
        currentPrice < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Current price cannot be negative",
        },
        { status: 400 }
      );
    }

    if (type === "Bonds") {
      if (
        !Number.isFinite(bondFaceValue) ||
        bondFaceValue! <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Bond face value is required",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isFinite(bondCouponRate) ||
        bondCouponRate! < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Bond coupon rate is invalid",
          },
          { status: 400 }
        );
      }

      if (
        !bondMaturityDate ||
        Number.isNaN(bondMaturityDate.getTime())
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Bond maturity date is required",
          },
          { status: 400 }
        );
      }

      if (
        bondMaturityDate <= parsedPurchaseDate
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Bond maturity date must be after purchase date",
          },
          { status: 400 }
        );
      }

      if (
        !bondInterestFrequency ||
        !VALID_BOND_FREQUENCIES.includes(
          bondInterestFrequency
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A valid bond interest frequency is required",
          },
          { status: 400 }
        );
      }
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

    const calculations =
      calculateInvestmentValues({
        quantity,
        purchasePrice: buyPrice,
        currentPrice,
      });

    investment.name = name;
    investment.type = type;

    investment.symbol =
      type === "Stocks" || type === "ETF"
        ? symbol || undefined
        : undefined;

    investment.schemeCode =
      type === "Mutual Funds"
        ? schemeCode || undefined
        : undefined;

    investment.goldPurity =
      type === "Gold"
        ? (goldPurity as
          | "18K"
          | "22K"
          | "24K")
        : undefined;

    investment.cryptoId =
      type === "Crypto"
        ? cryptoId || undefined
        : undefined;

    investment.cryptoSymbol =
      type === "Crypto"
        ? cryptoSymbol || undefined
        : undefined;

    investment.bondFaceValue =
      type === "Bonds"
        ? bondFaceValue
        : undefined;

    investment.bondCouponRate =
      type === "Bonds"
        ? bondCouponRate
        : undefined;

    investment.bondMaturityDate =
      type === "Bonds"
        ? bondMaturityDate
        : undefined;

    investment.bondInterestFrequency =
      type === "Bonds"
        ? bondInterestFrequency
        : undefined;

    investment.quantity = quantity;
    investment.averageBuyPrice = buyPrice;
    investment.totalInvested =
      calculations.totalInvested;

    investment.currentPrice = currentPrice;

    investment.currentValue =
      calculations.currentValue;

    investment.profitLoss =
      calculations.profitLoss;

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
    console.error(
      "PATCH /api/investments/[id] error:",
      error
    );

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

    await Investment.findOneAndDelete({
      _id: id,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: "Investment deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/investments/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete investment",
      },
      { status: 500 }
    );
  }
}