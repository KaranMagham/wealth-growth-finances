import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";
import InvestmentTransaction from "@/models/InvestmentTransaction";
import {
    calculateInvestmentValues,
} from "@/lib/investmentCalculations";
import mongoose from "mongoose";

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

        const investmentId = await getInvestmentId(context);

        if (!mongoose.Types.ObjectId.isValid(investmentId)) {
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
            _id: investmentId,
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
            investmentId,
            userId,
        })
            .sort({ date: -1, createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            transactions,
        });
    } catch (error) {
        console.error("GET investment transactions error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to load investment transactions",
            },
            { status: 500 }
        );
    }
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

        const investmentId = await getInvestmentId(context);
        const body = await request.json();

        const type = String(body.type ?? "").toUpperCase();
        const quantity = Number(body.quantity);
        const price = Number(body.price);
        const date = String(body.date ?? "");
        const notes = String(body.notes ?? "").trim();

        if (type !== "BUY" && type !== "SELL") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Transaction type must be BUY or SELL",
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

        if (!Number.isFinite(price) || price <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Price must be greater than zero",
                },
                { status: 400 }
            );
        }

        if (!date || Number.isNaN(new Date(date).getTime())) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A valid transaction date is required",
                },
                { status: 400 }
            );
        }

        await connectDB();

        const investment = await Investment.findOne({
            _id: investmentId,
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

        if (
            type === "SELL" &&
            quantity > investment.quantity
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot sell more units than you own",
                },
                { status: 400 }
            );
        }

        const amount = quantity * price;

        if (type === "BUY") {
            const oldQuantity = investment.quantity;
            const oldInvested = investment.totalInvested;

            const newQuantity = oldQuantity + quantity;
            const newInvested = oldInvested + amount;

            investment.quantity = newQuantity;
            investment.totalInvested = newInvested;
            investment.averageBuyPrice =
                newQuantity > 0 ? newInvested / newQuantity : 0;
        } else {
            const oldQuantity = investment.quantity;
            const averageBuyPrice = investment.averageBuyPrice;

            const newQuantity = oldQuantity - quantity;

            investment.quantity = newQuantity;
            investment.totalInvested =
            newQuantity * averageBuyPrice;

            if (newQuantity === 0) {
                investment.averageBuyPrice = 0;
                investment.totalInvested = 0;
            }
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

        const transaction = await InvestmentTransaction.create({
            userId,
            investmentId: investment._id,
            type,
            quantity,
            price,
            amount,
            date: new Date(date),
            notes: notes || undefined,
        });

        return NextResponse.json(
            {
                success: true,
                transaction,
                investment,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST investment transaction error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to create investment transaction",
            },
            { status: 500 }
        );
    }
}