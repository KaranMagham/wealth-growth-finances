import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";
import InvestmentTransaction from "@/models/InvestmentTransaction";
import {
    calculateInvestmentValues,
} from "@/lib/investmentCalculations";

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

async function getInvestmentId(context: RouteContext) {
    const { id } = await context.params;
    return id;
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

        const id = await getInvestmentId(context);

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

        return NextResponse.json({
            success: true,
            investment,
        });
    } catch (error) {
        console.error("GET investment error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to load investment",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
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

        const id = await getInvestmentId(context);
        const body = await request.json();

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

        if (body.name !== undefined) {
            const name = String(body.name).trim();

            if (!name) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Investment name cannot be empty",
                    },
                    { status: 400 }
                );
            }

            investment.name = name;
        }

        if (body.symbol !== undefined) {
            investment.symbol = String(body.symbol)
                .trim()
                .toUpperCase();
        }

        if (body.quantity !== undefined) {
            const quantity = Number(body.quantity);

            if (!Number.isFinite(quantity) || quantity <= 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Quantity must be greater than zero",
                    },
                    { status: 400 }
                );
            }

            investment.quantity = quantity;
        }

        if (body.buyPrice !== undefined) {
            const buyPrice = Number(body.buyPrice);

            if (!Number.isFinite(buyPrice) || buyPrice <= 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Buy price must be greater than zero",
                    },
                    { status: 400 }
                );
            }

            investment.averageBuyPrice = buyPrice;
        }

        if (body.currentPrice !== undefined) {
            const currentPrice = Number(body.currentPrice);

            if (!Number.isFinite(currentPrice) || currentPrice < 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Current price cannot be negative",
                    },
                    { status: 400 }
                );
            }

            investment.currentPrice = currentPrice;
        }

        if (body.purchaseDate !== undefined) {
            const purchaseDate = new Date(body.purchaseDate);

            if (Number.isNaN(purchaseDate.getTime())) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid purchase date",
                    },
                    { status: 400 }
                );
            }

            investment.purchaseDate = purchaseDate;
        }

        if (body.notes !== undefined) {
            investment.notes = String(body.notes).trim();
        }

        const {
            totalInvested,
            currentValue,
            profitLoss,
            returnPercentage,
        } = calculateInvestmentValues({
            quantity: investment.quantity,
            purchasePrice: investment.averageBuyPrice,
            currentPrice: investment.currentPrice,
        });

        investment.totalInvested = totalInvested;
        investment.currentValue = currentValue;
        investment.profitLoss = profitLoss;
        investment.returnPercentage = returnPercentage;

        await investment.save();

        return NextResponse.json({
            success: true,
            investment,
        });
    } catch (error) {
        console.error("PATCH investment error:", error);

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
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const userId = await getUserId();
        const id = await getInvestmentId(context);

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

        await InvestmentTransaction.deleteMany({
            investmentId: investment._id,
            userId,
        });

        await Investment.deleteOne({
            _id: investment._id,
            userId,
        });

        return NextResponse.json({
            success: true,
            message: "Investment deleted successfully",
        });
    } catch (error) {
        console.error("DELETE investment error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to delete investment",
            },
            { status: 500 }
        );
    }
}