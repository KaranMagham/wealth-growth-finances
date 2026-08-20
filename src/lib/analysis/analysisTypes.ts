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

export type NetWorthTrendItem = {
  label: string;
  netWorth: number;
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

    currentNetWorth: number | null;

    investmentValue: number;
    totalInvested: number;
    investmentProfitLoss: number;
    investmentReturnPercentage: number;
  };

  expenseBreakdown: ExpenseBreakdownItem[];

  incomeExpenseTrend: IncomeExpenseTrendItem[];

  savingsTrend: SavingsTrendItem[];

  investmentDistribution: InvestmentDistributionItem[];

  goals: {
    totalGoals: number;
    completedGoals: number;
    targetAmount: number;
    savedAmount: number;
    overallProgress: number;
  };

  netWorthTrend: NetWorthTrendItem[];

  dataStatus: {
    hasTransactions: boolean;
    hasBudgets: boolean;
    hasGoals: boolean;
    hasInvestments: boolean;
    hasAssets: boolean;
    hasLiabilities: boolean;
    hasNetWorthHistory: boolean;
  };
};