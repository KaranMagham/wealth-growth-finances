import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Investment from "@/models/Investment";

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
            .select("type currentValue totalInvested")
            .lean();

        const allocationMap = new Map<
            string,
            {
                amount: number;
                investedAmount: number;
                investmentCount: number;
            }
        >();

        for (const investment of investments) {
            const type = investment.type;
            const currentValue = Number(investment.currentValue || 0);
            const totalInvested = Number(investment.totalInvested || 0);

            const existing = allocationMap.get(type) || {
                amount: 0,
                investedAmount: 0,
                investmentCount: 0,
            };

            allocationMap.set(type, {
                amount: existing.amount + currentValue,
                investedAmount: existing.investedAmount + totalInvested,
                investmentCount: existing.investmentCount + 1,
            });
        }

        const totalCurrentValue = Array.from(
            allocationMap.values()
        ).reduce((total, item) => total + item.amount, 0);

        const allocation = Array.from(allocationMap.entries())
            .map(([type, item]) => ({
                type,
                amount: Number(item.amount.toFixed(2)),
                investedAmount: Number(item.investedAmount.toFixed(2)),
                investmentCount: item.investmentCount,
                percentage:
                    totalCurrentValue > 0
                        ? Number(((item.amount / totalCurrentValue) * 100).toFixed(2))
                        : 0,
            }))
            .sort((a, b) => b.amount - a.amount);

        return NextResponse.json({
            success: true,
            totalCurrentValue,
            allocation,
        });
    } catch (error) {
        console.error("GET investment allocation error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to load investment allocation",
            },
            { status: 500 }
        );
    }
}