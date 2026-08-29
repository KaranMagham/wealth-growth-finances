export type InsightSeverity =
  | "info"
  | "warning"
  | "positive";

export interface FinancialInsight {
  id: string;
  title: string;
  message: string;
  severity: InsightSeverity;
  category:
    | "budget"
    | "spending"
    | "savings"
    | "goals"
    | "investments";
}

interface InsightInput {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  budgetedAmount: number;
  budgetUsed: number;
  topExpenseCategory?: string;
  topExpenseAmount?: number;
  topExpensePercentage?: number;
  investmentValue: number;
  investmentReturn: number;
  goalProgress: number;
}

export function generateInsights(
  input: InsightInput
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  const budgetUsage =
    input.budgetedAmount > 0
      ? (input.budgetUsed /
          input.budgetedAmount) *
        100
      : 0;

  if (budgetUsage >= 100) {
    insights.push({
      id: "budget-exceeded",
      title: "Budget exceeded",
      message: `You have used ${budgetUsage.toFixed(
        1
      )}% of your budget.`,
      severity: "warning",
      category: "budget",
    });
  } else if (budgetUsage >= 80) {
    insights.push({
      id: "budget-nearly-used",
      title: "Budget nearly used",
      message: `You have used ${budgetUsage.toFixed(
        1
      )}% of your budget.`,
      severity: "warning",
      category: "budget",
    });
  }

  if (
    input.topExpenseCategory &&
    input.topExpensePercentage &&
    input.topExpensePercentage >= 40
  ) {
    insights.push({
      id: "top-expense-category",
      title: "Spending concentration",
      message: `${input.topExpenseCategory} represents ${input.topExpensePercentage.toFixed(
        1
      )}% of your expenses this period.`,
      severity: "info",
      category: "spending",
    });
  }

  if (input.savingsRate >= 30) {
    insights.push({
      id: "strong-savings-rate",
      title: "Strong savings rate",
      message: `Your savings rate is ${input.savingsRate.toFixed(
        1
      )}%.`,
      severity: "positive",
      category: "savings",
    });
  } else if (input.savingsRate < 10) {
    insights.push({
      id: "low-savings-rate",
      title: "Savings need attention",
      message: `Your savings rate is ${input.savingsRate.toFixed(
        1
      )}%.`,
      severity: "warning",
      category: "savings",
    });
  }

  if (input.goalProgress >= 75) {
    insights.push({
      id: "goal-near-complete",
      title: "Goal nearly complete",
      message: `Your overall goal progress is ${input.goalProgress.toFixed(
        1
      )}%.`,
      severity: "positive",
      category: "goals",
    });
  }

  if (input.investmentReturn > 0) {
    insights.push({
      id: "positive-investment-return",
      title: "Portfolio is positive",
      message: `Your recorded portfolio return is ${input.investmentReturn.toFixed(
        2
      )}%.`,
      severity: "positive",
      category: "investments",
    });
  }

  return insights;
}