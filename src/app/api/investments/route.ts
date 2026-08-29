import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";
import InvestmentTransaction from "@/models/InvestmentTransaction";
import {
  calculateInvestmentValues,
} from "@/lib/investmentCalculations";
import { createNotification } from "@/lib/notifications/createNotification";

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

type BondInterestFrequency =
  | "Monthly"
  | "Quarterly"
  | "Half-yearly"
  | "Yearly";

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
      .sort({ createdAt: -1 })
      .lean();

    // Optional: add investment milestone notifications here
    // if you want them triggered on every fetch.

    return NextResponse.json({
      success: true,
      investments,
    });
  } catch (error) {
    console.error(
      "GET /api/investments error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load investments",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();

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

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const type = body.type as InvestmentType;

    const symbol = String(body.symbol ?? "")
      .trim()
      .toUpperCase();

    const schemeCode = String(body.schemeCode ?? "")
      .trim();

    const goldPurity = String(body.goldPurity ?? "")
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

    if (type === "Mutual Funds") {
      if (!/^\d+$/.test(schemeCode)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A valid mutual fund scheme code is required",
          },
          { status: 400 }
        );
      }
    }

    if (type === "Gold") {
      if (
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
    }

    if (type === "Crypto") {
      if (!cryptoId) {
        return NextResponse.json(
          {
            success: false,
            message: "Crypto coin ID is required",
          },
          { status: 400 }
        );
      }

      if (!cryptoSymbol) {
        return NextResponse.json(
          {
            success: false,
            message: "Crypto symbol is required",
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

    const calculations =
      calculateInvestmentValues({
        quantity,
        purchasePrice: buyPrice,
        currentPrice,
      });

    let createdInvestment;
    let createdTransaction;

    await session.withTransaction(async () => {
      const investments = await Investment.create(
        [
          {
            userId,
            name,
            type,

            symbol:
              type === "Stocks" || type === "ETF"
                ? symbol || undefined
                : undefined,

            schemeCode:
              type === "Mutual Funds"
                ? schemeCode || undefined
                : undefined,

            goldPurity:
              type === "Gold"
                ? (goldPurity as
                    | "18K"
                    | "22K"
                    | "24K")
                : undefined,

            cryptoId:
              type === "Crypto"
                ? cryptoId || undefined
                : undefined,

            cryptoSymbol:
              type === "Crypto"
                ? cryptoSymbol || undefined
                : undefined,

            bondFaceValue:
              type === "Bonds"
                ? bondFaceValue
                : undefined,

            bondCouponRate:
              type === "Bonds"
                ? bondCouponRate
                : undefined,

            bondMaturityDate:
              type === "Bonds"
                ? bondMaturityDate
                : undefined,

            bondInterestFrequency:
              type === "Bonds"
                ? bondInterestFrequency
                : undefined,

            quantity,
            averageBuyPrice: buyPrice,
            totalInvested:
              calculations.totalInvested,

            currentPrice,

            currentValue:
              calculations.currentValue,

            profitLoss:
              calculations.profitLoss,

            returnPercentage:
              calculations.returnPercentage,

            purchaseDate: parsedPurchaseDate,
            notes: notes || undefined,
            priceSource: "MANUAL",
            priceUpdatedAt: new Date(),
          },
        ],
        { session }
      );

      createdInvestment = investments[0];

      const transactions =
        await InvestmentTransaction.create(
          [
            {
              userId,
              investmentId:
                createdInvestment._id,
              type: "BUY",
              quantity,
              price: buyPrice,
              amount: calculations.totalInvested,
              date: parsedPurchaseDate,
              notes: notes || undefined,
            },
          ],
          { session }
        );

      createdTransaction = transactions[0];

      // ---- Investment milestone notification ----
      const returnPct = calculations.returnPercentage;
      const RETURN_THRESHOLDS = [10, 25, 50];

      for (const threshold of RETURN_THRESHOLDS) {
        if (
          returnPct >= threshold &&
          returnPct < threshold + 1
        ) {
          await createNotification({
            userId,
            category: "investment",
            severity:
              returnPct >= 50
                ? "SUCCESS"
                : "INFO",
            title: "Strong investment return",
            message: `Your investment "${name}" is up ${returnPct.toFixed(1)}% (₹${calculations.profitLoss.toFixed(2)}).`,
            ruleKey: `investment-return:${createdInvestment._id.toString()}:${threshold}`,
            metadata: {
              investmentId: createdInvestment._id.toString(),
              name,
              type,
              returnPercentage: returnPct,
              profitLoss: calculations.profitLoss,
              threshold,
            },
          });
        }
      }
      // -------------------------------------------
    });

    return NextResponse.json(
      {
        success: true,
        investment: createdInvestment,
        transaction: createdTransaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/investments error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create investment",
      },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
}