import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/lib/auth";
import { getAnalysisPeriod } from "@/lib/analysis/getAnalysisPeriod";
import { getAnalysisData } from "@/lib/analysis/getAnalysisData";
import { buildFinancialContext } from "@/lib/wealth-assistant/buildFinancialContext";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const period = getAnalysisPeriod(
      searchParams.get("period") ||
        "last-3-months",
      searchParams.get("from"),
      searchParams.get("to")
    );

    const analysis = await getAnalysisData(
      userId,
      period
    );

    const context = buildFinancialContext({
      availableCash: Math.max(
        0,
        analysis.summary.savings
      ),

      averageMonthlyIncome:
        analysis.summary.income,

      averageMonthlyExpenses:
        analysis.summary.expenses,

      averageMonthlySavings:
        analysis.summary.savings,

      essentialMonthlyExpenses:
        analysis.summary.expenses,

      upcomingGoalRequirement: Math.max(
        0,
        analysis.goals.targetAmount -
          analysis.goals.savedAmount
      ),

      existingBudgetCommitments:
        analysis.summary.budgetUsed,

      currentInvestments:
        analysis.summary.investmentValue,
    });

    return NextResponse.json({
      success: true,
      period: analysis.period,
      context,
    });
  } catch (error) {
    console.error(
      "Wealth assistant context error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to prepare financial context.",
      },
      { status: 500 }
    );
  }
}