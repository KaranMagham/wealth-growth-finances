import { getAnalysisData } from "@/lib/analysis/getAnalysisData";
import { getAnalysisPeriod } from "@/lib/analysis/getAnalysisPeriod";
import type { AnalysisPeriod } from "@/lib/analysis/analysisTypes";

import { buildFinancialContext, type FinancialContext } from "./buildFinancialContext";

export function getAssistantPeriod(question: string, now = new Date()): AnalysisPeriod {
  const normalized = question.toLowerCase();
  const currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrow = new Date(currentStart.getTime() + 86400000);

  if (/\btoday\b/.test(normalized)) {
    return getAnalysisPeriod("custom", currentStart.toISOString().slice(0, 10), tomorrow.toISOString().slice(0, 10));
  }

  if (/\bthis week\b|\bweekly\b/.test(normalized)) {
    const day = currentStart.getUTCDay() || 7;
    const start = new Date(currentStart.getTime() - (day - 1) * 86400000);
    return getAnalysisPeriod("custom", start.toISOString().slice(0, 10), currentStart.toISOString().slice(0, 10));
  }

  if (/\blast month\b/.test(normalized)) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
    return getAnalysisPeriod("custom", start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
  }

  if (/\bthis year\b|\byear to date\b/.test(normalized)) {
    return getAnalysisPeriod("this-year", null, null, now);
  }

  if (/\boverall\b|\ball[- ]time\b|\bever\b/.test(normalized)) {
    return getAnalysisPeriod("custom", "1970-01-01", tomorrow.toISOString().slice(0, 10));
  }

  if (/\b(last|past)\s+(3|6)\s+months?\b/.test(normalized)) {
    return getAnalysisPeriod(normalized.includes("6") ? "last-6-months" : "last-3-months", null, null, now);
  }

  return getAnalysisPeriod("this-month", null, null, now);
}

export async function getWealthAssistantContext(
  userId: string,
  question: string
): Promise<{ period: AnalysisPeriod; context: FinancialContext; analysis: Awaited<ReturnType<typeof getAnalysisData>> }> {
  const period = getAssistantPeriod(question);
  return getWealthAssistantContextForPeriod(userId, period, question);
}

export async function getWealthAssistantContextForPeriod(
  userId: string,
  period: AnalysisPeriod,
  question = ""
): Promise<{ period: AnalysisPeriod; context: FinancialContext; analysis: Awaited<ReturnType<typeof getAnalysisData>> }> {
  const analysis = await getAnalysisData(userId, period);
  const months = Math.max(1, analysis.incomeExpenseTrend.length);
  const normalizedQuestion = question.toLowerCase();
  const detailRequested = /specific|which|what did|merchant|transaction|category|food|grocery|amazon|goal|investment|holding|budget/.test(normalizedQuestion);
  const matchesQuestion = (value: string) => normalizedQuestion.includes(value.toLowerCase());
  const relevantTransactions = detailRequested
    ? analysis.transactions.filter((transaction) => [transaction.category, transaction.merchant, transaction.description].some((value) => matchesQuestion(value))).slice(0, 50)
    : [];
  const relevantGoals = detailRequested
    ? analysis.goals.items.filter((goal) => matchesQuestion(goal.name)).slice(0, 20)
    : [];
  const relevantInvestments = detailRequested
    ? analysis.investments.filter((investment) => [investment.name, investment.type, investment.symbol || ""].some((value) => matchesQuestion(value))).slice(0, 20)
    : [];

  const context = buildFinancialContext({
    averageMonthlyIncome: analysis.summary.income / months,
    averageMonthlyExpenses: analysis.summary.expenses / months,
    averageMonthlySavings: analysis.summary.savings / months,
    savingsRate: analysis.summary.savingsRate,
    budgetedAmount: analysis.summary.budgetedAmount,
    budgetUsed: analysis.summary.budgetUsed,
    essentialMonthlyExpenses: analysis.summary.expenses / months,
    upcomingGoalRequirement: Math.max(0, analysis.goals.targetAmount - analysis.goals.savedAmount),
    existingBudgetCommitments: analysis.summary.budgetUsed,
    currentInvestments: analysis.summary.investmentValue,
    totalInvested: analysis.summary.totalInvested,
    investmentProfitLoss: analysis.summary.investmentProfitLoss,
    investmentReturnPercentage: analysis.summary.investmentReturnPercentage,
    expenseBreakdown: analysis.expenseBreakdown,
    incomeExpenseTrend: analysis.incomeExpenseTrend,
    savingsTrend: analysis.savingsTrend,
    investmentDistribution: analysis.investmentDistribution,
    goals: {
      totalGoals: analysis.goals.totalGoals,
      completedGoals: analysis.goals.completedGoals,
      targetAmount: analysis.goals.targetAmount,
      savedAmount: analysis.goals.savedAmount,
      overallProgress: analysis.goals.overallProgress,
    },
    dataStatus: {
      hasTransactions: analysis.dataStatus.hasTransactions,
      hasBudgets: analysis.dataStatus.hasBudgets,
      hasGoals: analysis.dataStatus.hasGoals,
      hasInvestments: analysis.dataStatus.hasInvestments,
    },
    transactions: relevantTransactions,
    budgets: detailRequested ? analysis.budgetBreakdown : [],
    goalItems: relevantGoals,
    investmentItems: relevantInvestments,
  });

  return { period, context, analysis };
}