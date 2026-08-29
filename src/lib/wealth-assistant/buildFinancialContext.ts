import type {
  AffordabilityInput,
} from "./assistantTypes";

export interface FinancialContext {
  affordability: AffordabilityInput;

  summary: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    budgetedAmount: number;
    budgetUsed: number;
    currentInvestments: number;
    totalInvested: number;
    investmentProfitLoss: number;
    investmentReturnPercentage: number;
  };

  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;

  incomeExpenseTrend: Array<{
    label: string;
    income: number;
    expenses: number;
    savings: number;
  }>;

  savingsTrend: Array<{
    label: string;
    savings: number;
  }>;

  investmentDistribution: Array<{
    type: string;
    amount: number;
    investedAmount: number;
    profitLoss: number;
    percentage: number;
  }>;

  goals: {
    totalGoals: number;
    completedGoals: number;
    targetAmount: number;
    savedAmount: number;
    overallProgress: number;
  };

  dataStatus: {
    hasTransactions: boolean;
    hasBudgets: boolean;
    hasGoals: boolean;
    hasInvestments: boolean;
  };

  generatedAt: string;
}

interface BuildFinancialContextInput {
  availableCash: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  averageMonthlySavings: number;
  savingsRate?: number;
  budgetedAmount?: number;
  budgetUsed?: number;
  essentialMonthlyExpenses?: number;
  upcomingGoalRequirement?: number;
  existingBudgetCommitments?: number;
  currentInvestments?: number;
  totalInvested?: number;
  investmentProfitLoss?: number;
  investmentReturnPercentage?: number;
  expenseBreakdown?: FinancialContext["expenseBreakdown"];
  incomeExpenseTrend?: FinancialContext["incomeExpenseTrend"];
  savingsTrend?: FinancialContext["savingsTrend"];
  investmentDistribution?: FinancialContext["investmentDistribution"];
  goals?: FinancialContext["goals"];
  dataStatus?: FinancialContext["dataStatus"];
}

function safeNumber(value: number | undefined) {
  return Number.isFinite(value) && value !== undefined
    ? Math.max(0, value)
    : 0;
}

export function buildFinancialContext(
  input: BuildFinancialContextInput
): FinancialContext {
  const income = safeNumber(
    input.averageMonthlyIncome
  );

  const expenses = safeNumber(
    input.averageMonthlyExpenses
  );

  const savings = Math.max(
    0,
    safeNumber(input.averageMonthlySavings)
  );

  const essentialExpenses = safeNumber(
    input.essentialMonthlyExpenses ??
      input.averageMonthlyExpenses
  );

  const savingsRate =
    input.savingsRate !== undefined
      ? safeNumber(input.savingsRate)
      : income > 0
        ? (savings / income) * 100
        : 0;

  return {
    affordability: {
      purchasePrice: 0,
      availableCash: safeNumber(input.availableCash),
      averageMonthlyIncome: income,
      averageMonthlyExpenses: expenses,
      averageMonthlySavings: savings,
      essentialMonthlyExpenses: essentialExpenses,
      upcomingGoalRequirement: safeNumber(
        input.upcomingGoalRequirement
      ),
      existingBudgetCommitments: safeNumber(
        input.existingBudgetCommitments
      ),
      currentInvestments: safeNumber(
        input.currentInvestments
      ),
    },

    summary: {
      income,
      expenses,
      savings,
      savingsRate,
      budgetedAmount: safeNumber(
        input.budgetedAmount
      ),
      budgetUsed: safeNumber(input.budgetUsed),
      currentInvestments: safeNumber(
        input.currentInvestments
      ),
      totalInvested: safeNumber(
        input.totalInvested
      ),
      investmentProfitLoss: safeNumber(
        input.investmentProfitLoss
      ),
      investmentReturnPercentage: safeNumber(
        input.investmentReturnPercentage
      ),
    },

    expenseBreakdown:
      input.expenseBreakdown ?? [],

    incomeExpenseTrend:
      input.incomeExpenseTrend ?? [],

    savingsTrend: input.savingsTrend ?? [],

    investmentDistribution:
      input.investmentDistribution ?? [],

    goals: input.goals ?? {
      totalGoals: 0,
      completedGoals: 0,
      targetAmount: 0,
      savedAmount: 0,
      overallProgress: 0,
    },

    dataStatus: input.dataStatus ?? {
      hasTransactions: false,
      hasBudgets: false,
      hasGoals: false,
      hasInvestments: false,
    },

    generatedAt: new Date().toISOString(),
  };
}