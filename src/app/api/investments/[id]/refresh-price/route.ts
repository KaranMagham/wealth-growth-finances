import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";
import { calculateInvestmentValues } from "@/lib/investmentCalculations";

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

export async function POST(
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

        const { id } = await context.params;

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

        if (!investment.symbol) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This investment does not have a market symbol",
                },
                { status: 400 }
            );
        }

        if (investment.type !== "Stocks") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Automatic price refresh currently supports stocks only",
                },
                { status: 400 }
            );
        }

        const quoteUrl = new URL(
            `${request.nextUrl.origin}/api/market/stocks/quote`
        );

        quoteUrl.searchParams.set(
            "symbol",
            investment.symbol
        );

        const quoteResponse = await fetch(quoteUrl.toString(), {
            method: "GET",
            cache: "no-store",
        });

        const quoteData = await quoteResponse.json();

        if (!quoteResponse.ok || !quoteData.success) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        quoteData.message ||
                        "Unable to retrieve market price",
                },
                { status: quoteResponse.status || 502 }
            );
        }

        const currentPrice = Number(quoteData.quote.price);

        if (!Number.isFinite(currentPrice) || currentPrice < 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Market provider returned an invalid price",
                },
                { status: 502 }
            );
        }

        const calculations = calculateInvestmentValues({
            quantity: investment.quantity,
            purchasePrice: investment.averageBuyPrice,
            currentPrice,
        });

        investment.currentPrice = currentPrice;
        investment.totalInvested = calculations.totalInvested;
        investment.currentValue = calculations.currentValue;
        investment.profitLoss = calculations.profitLoss;
        investment.returnPercentage = calculations.returnPercentage;
        investment.priceSource = "MARKET_API";
        investment.priceUpdatedAt = new Date();

        await investment.save();

        return NextResponse.json({
            success: true,
            investment,
            quote: quoteData.quote,
        });
    } catch (error) {
        console.error("Refresh investment price error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to refresh investment price",
            },
            { status: 500 }
        );
    }
}