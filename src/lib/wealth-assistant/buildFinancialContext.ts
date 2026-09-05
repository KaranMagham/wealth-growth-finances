import type {
  AffordabilityInput,
} from "./assistantTypes";
import type {
  BudgetAnalysisItem,
  GoalAnalysisItem,
  InvestmentAnalysisItem,
  TransactionAnalysisItem,
} from "@/lib/analysis/analysisTypes";

export interface FinancialContext {
  affordability: AffordabilityInput;

  financialData: {
    transactions: TransactionAnalysisItem[];
    budgets: BudgetAnalysisItem[];
    goals: GoalAnalysisItem[];
    investments: InvestmentAnalysisItem[];
  };

  summary: {
    income: number;
    expenses: number;
    monthlySurplus: number;
    accountBalance: number | null;
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
  availableBalance?: number | null;
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
  transactions?: TransactionAnalysisItem[];
  budgets?: BudgetAnalysisItem[];
  goalItems?: GoalAnalysisItem[];
  investmentItems?: InvestmentAnalysisItem[];
}

function safeNumber(value: number | undefined) {
  return Number.isFinite(value) && value !== undefined
    ? value
    : 0;
}

function nonNegative(value: number | undefined) {
  return Math.max(0, safeNumber(value));
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

  const savings = safeNumber(
    input.averageMonthlySavings
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
      availableCash:
        input.availableBalance === null || input.availableBalance === undefined
          ? null
          : nonNegative(input.availableBalance),
      averageMonthlyIncome: income,
      averageMonthlyExpenses: expenses,
      averageMonthlySavings: savings,
      essentialMonthlyExpenses: essentialExpenses,
      upcomingGoalRequirement: nonNegative(
        input.upcomingGoalRequirement
      ),
      existingBudgetCommitments: nonNegative(
        input.existingBudgetCommitments
      ),
      currentInvestments: nonNegative(
        input.currentInvestments
      ),
    },

    summary: {
      income,
      expenses,
      monthlySurplus: savings,
      accountBalance: input.availableBalance ?? null,
      savingsRate,
      budgetedAmount: nonNegative(
        input.budgetedAmount
      ),
      budgetUsed: nonNegative(input.budgetUsed),
      currentInvestments: nonNegative(
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

    financialData: {
      transactions: input.transactions ?? [],
      budgets: input.budgets ?? [],
      goals: input.goalItems ?? [],
      investments: input.investmentItems ?? [],
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