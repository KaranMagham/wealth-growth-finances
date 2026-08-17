import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";
import InvestmentTransaction from "@/models/InvestmentTransaction";
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

type InvestmentType = (typeof INVESTMENT_TYPES)[number];

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

        const investments = await Investment.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            investments,
        });
    } catch (error) {
        console.error("GET /api/investments error:", error);

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

        const quantity = Number(body.quantity);
        const buyPrice = Number(body.buyPrice);

        const currentPrice =
            body.currentPrice === undefined ||
                body.currentPrice === ""
                ? buyPrice
                : Number(body.currentPrice);

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

        if (!Number.isFinite(currentPrice) || currentPrice < 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Current price cannot be negative",
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

        const calculations = calculateInvestmentValues({
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
                        symbol: symbol || undefined,
                        quantity,
                        averageBuyPrice: buyPrice,
                        totalInvested: calculations.totalInvested,
                        currentPrice,
                        currentValue: calculations.currentValue,
                        profitLoss: calculations.profitLoss,
                        returnPercentage: calculations.returnPercentage,
                        purchaseDate: parsedPurchaseDate,
                        notes: notes || undefined,
                        priceSource: "MANUAL",
                        priceUpdatedAt: new Date(),
                    },
                ],
                { session }
            );

            createdInvestment = investments[0];

            const transactions = await InvestmentTransaction.create(
                [
                    {
                        userId,
                        investmentId: createdInvestment._id,
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
        console.error("POST /api/investments error:", error);

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