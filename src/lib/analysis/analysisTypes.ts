export const ANALYSIS_PERIOD_KEYS = [
  "this-month",
  "last-3-months",
  "last-6-months",
  "this-year",
  "custom",
] as const;

export type AnalysisPeriodKey =
  (typeof ANALYSIS_PERIOD_KEYS)[number];

export type AnalysisPeriod = {
  key: AnalysisPeriodKey;
  label: string;
  from: string;
  to: string;
  start: Date;
  endExclusive: Date;
};

export type ExpenseBreakdownItem = {
  category: string;
  amount: number;
  percentage: number;
};

export type TransactionAnalysisItem = {
  id: string;
  type: "Income" | "Expense";
  amount: number;
  category: string;
  description: string;
  merchant: string;
  date: string;
};

export type RecurringExpenseItem = {
  category: string;
  merchant: string;
  amount: number;
  occurrenceCount: number;
  averageAmount: number;
  lastDate: string;
};

export type IncomeSourceItem = {
  source: string;
  amount: number;
  occurrenceCount: number;
};

export type BudgetAnalysisItem = {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  usagePercentage: number;
  status:
    | "under_budget"
    | "nearly_exhausted"
    | "exceeded";
};

export type IncomeExpenseTrendItem = {
  label: string;
  income: number;
  expenses: number;
  savings: number;
};

export type SavingsTrendItem = {
  label: string;
  savings: number;
};

export type InvestmentDistributionItem = {
  type: string;
  amount: number;
  investedAmount: number;
  profitLoss: number;
  percentage: number;
};

export type InvestmentAnalysisItem = {
  id: string;
  name: string;
  type: string;
  symbol?: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  returnPercentage: number;
  purchaseDate?: string;
};

export type GoalAnalysisItem = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  deadline?: string;
  completed: boolean;
};

export type NetWorthTrendItem = {
  label: string;
  netWorth: number;
};

export type AnalysisDataStatus = {
  hasTransactions: boolean;
  hasBudgets: boolean;
  hasGoals: boolean;
  hasInvestments: boolean;
  hasAssets: boolean;
  hasLiabilities: boolean;
  hasNetWorthHistory: boolean;
};

export type AnalysisResponse = {
  success: true;

  period: {
    key: AnalysisPeriodKey;
    label: string;
    from: string;
    to: string;
  };

  summary: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;

    budgetedAmount: number;
    budgetUsed: number;
    budgetRemaining: number;
    budgetUsagePercentage: number;

    currentNetWorth: number | null;

    investmentValue: number;
    totalInvested: number;
    investmentProfitLoss: number;
    investmentReturnPercentage: number;

    transactionCount: number;
    expenseTransactionCount: number;
    incomeTransactionCount: number;

    averageDailySpending: number;
    averageWeeklySpending: number;
    averageMonthlySpending: number;
  };

  expenseBreakdown: ExpenseBreakdownItem[];

  transactions: TransactionAnalysisItem[];

  biggestExpenses: TransactionAnalysisItem[];

  recurringExpenses: RecurringExpenseItem[];

  incomeSources: IncomeSourceItem[];

  budgetBreakdown: BudgetAnalysisItem[];

  incomeExpenseTrend: IncomeExpenseTrendItem[];

  savingsTrend: SavingsTrendItem[];

  investmentDistribution: InvestmentDistributionItem[];

  investments: InvestmentAnalysisItem[];

  goals: {
    totalGoals: number;
    completedGoals: number;
    targetAmount: number;
    savedAmount: number;
    remainingAmount: number;
    overallProgress: number;
    items: GoalAnalysisItem[];
  };

  netWorthTrend: NetWorthTrendItem[];

  dataStatus: AnalysisDataStatus;
};