import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/lib/auth";
import { getAnalysisPeriod } from "@/lib/analysis/getAnalysisPeriod";
import { getAnalysisData } from "@/lib/analysis/getAnalysisData";
import { detectIntent } from "@/lib/wealth-assistant/detectIntent";
import { calculateAffordability } from "@/lib/wealth-assistant/calculateAffordability";
import { buildFinancialContext } from "@/lib/wealth-assistant/buildFinancialContext";
import { generateAiSuggestion } from "@/lib/wealth-assistant/generateAiSuggestion";
import { shouldUseWebSearch } from "@/lib/wealth-assistant/shouldUseWebSearch";

export const dynamic = "force-dynamic";

interface AskRequest {
  question?: string;
}

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function getWebSearchFlag(question: string) {
  return (
    process.env.AI_ENABLE_WEB_SEARCH === "true" &&
    shouldUseWebSearch(question)
  );
}

function buildLocalAnswer(
  question: string,
  analysis: Awaited<ReturnType<typeof getAnalysisData>>
) {
  const normalized = question.toLowerCase();

  const lines: string[] = [];

  const topCategory =
    analysis.expenseBreakdown[0];

  const asksSpending =
    normalized.includes("spend") ||
    normalized.includes("expense");

  const asksSavings =
    normalized.includes("save") ||
    normalized.includes("saving");

  const asksIncome =
    normalized.includes("income") ||
    normalized.includes("earn");

  const asksInvestment =
    normalized.includes("investment") ||
    normalized.includes("portfolio");

  const asksGoal =
    normalized.includes("goal") ||
    normalized.includes("target");

  const asksBudget =
    normalized.includes("budget");

  const asksAdvice =
    normalized.includes("what should i do") ||
    normalized.includes("how can i reduce") ||
    normalized.includes("reduce my") ||
    normalized.includes("advice") ||
    normalized.includes("recommend");

  if (asksSpending) {
    if (!topCategory) {
      lines.push(
        "You have no recorded expenses for this period."
      );
    } else {
      lines.push(
        `You spent ${formatCurrency(
          analysis.summary.expenses
        )} this month.`
      );

      lines.push(
        `Your largest spending category is ${
          topCategory.category
        } at ${formatCurrency(
          topCategory.amount
        )}.`
      );
    }
  }

  if (asksSavings) {
    lines.push(
      `You saved approximately ${formatCurrency(
        analysis.summary.savings
      )} this month, giving you a savings rate of ${Math.round(
        analysis.summary.savingsRate
      )}%.`
    );
  }

  if (asksIncome) {
    lines.push(
      `Your recorded income this month is ${formatCurrency(
        analysis.summary.income
      )}.`
    );
  }

  if (asksInvestment) {
    lines.push(
      `Your current recorded investment value is ${formatCurrency(
        analysis.summary.investmentValue
      )}, with a recorded profit or loss of ${formatCurrency(
        analysis.summary.investmentProfitLoss
      )}.`
    );
  }

  if (asksGoal) {
    lines.push(
      `You have ${
        analysis.goals.totalGoals
      } goal(s), with overall progress of ${Math.round(
        analysis.goals.overallProgress
      )}%.`
    );
  }

  if (asksBudget) {
    lines.push(
      `You have used ${formatCurrency(
        analysis.summary.budgetUsed
      )} of your ${formatCurrency(
        analysis.summary.budgetedAmount
      )} budget.`
    );
  }

  if (asksAdvice && topCategory) {
    lines.push(
      `To reduce expenses, review your ${
        topCategory.category
      } spending first because it is your largest recorded category.`
    );

    lines.push(
      "You can also review recurring expenses and compare each category with your budget."
    );
  }

  if (lines.length === 0) {
    lines.push(
      "I can answer questions about your income, expenses, savings, budgets, goals, and investments."
    );
  }

  return lines.join("\n\n");
}

export async function POST(request: NextRequest) {
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

    let body: AskRequest;

    try {
      body = (await request.json()) as AskRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: "Question is required.",
        },
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Question must be 500 characters or fewer.",
        },
        { status: 400 }
      );
    }

    const detected = detectIntent(question);

    const period = getAnalysisPeriod(
      "this-month",
      null,
      null
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
      savingsRate:
        analysis.summary.savingsRate,
      budgetedAmount:
        analysis.summary.budgetedAmount,
      budgetUsed:
        analysis.summary.budgetUsed,
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
      totalInvested:
        analysis.summary.totalInvested,
      investmentProfitLoss:
        analysis.summary.investmentProfitLoss,
      investmentReturnPercentage:
        analysis.summary.investmentReturnPercentage,
      expenseBreakdown:
        analysis.expenseBreakdown,
      incomeExpenseTrend:
        analysis.incomeExpenseTrend,
      savingsTrend:
        analysis.savingsTrend,
      investmentDistribution:
        analysis.investmentDistribution,
      goals: analysis.goals,
      dataStatus: {
        hasTransactions:
          analysis.dataStatus.hasTransactions,
        hasBudgets:
          analysis.dataStatus.hasBudgets,
        hasGoals:
          analysis.dataStatus.hasGoals,
        hasInvestments:
          analysis.dataStatus.hasInvestments,
      },
    });

    const webSearchUsed =
      getWebSearchFlag(question);

    const aiAnswer =
      await generateAiSuggestion({
        question,
        financialContext: context,
        useWebSearch: webSearchUsed,
      });

    if (aiAnswer) {
      return NextResponse.json({
        success: true,
        intent: detected.intent,
        confidence: detected.confidence,
        answer: aiAnswer,
        period: analysis.period,
        aiGenerated: true,
        webSearchUsed,
      });
    }

    if (detected.intent === "affordability") {
      if (
        !detected.purchasePrice ||
        detected.purchasePrice <= 0
      ) {
        return NextResponse.json({
          success: true,
          intent: detected.intent,
          confidence: detected.confidence,
          answer:
            "Please include the purchase price, such as ₹2 lakh or ₹2,00,000.",
          period: analysis.period,
          aiGenerated: false,
          webSearchUsed,
        });
      }

      const result =
        calculateAffordability({
          ...context.affordability,
          purchasePrice:
            detected.purchasePrice,
        });

      return NextResponse.json({
        success: true,
        intent: detected.intent,
        confidence: detected.confidence,
        answer: `Based on your recorded financial data:

${result.reasons.join("\n")}

This is an informational estimate, not guaranteed financial advice.`,
        calculation: result,
        period: analysis.period,
        aiGenerated: false,
        webSearchUsed,
      });
    }

    return NextResponse.json({
      success: true,
      intent: detected.intent,
      confidence: detected.confidence,
      answer: buildLocalAnswer(
        question,
        analysis
      ),
      period: analysis.period,
      aiGenerated: false,
      webSearchUsed: false,
    });
  } catch (error) {
    console.error(
      "Wealth assistant ask error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process your financial question.",
      },
      { status: 500 }
    );
  }
}