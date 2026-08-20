import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Budget from "@/models/Budget";
import Goal from "@/models/Goal";
import Investment from "@/models/Investment";

import type {
  AnalysisPeriod,
  AnalysisResponse,
  IncomeExpenseTrendItem,
  InvestmentDistributionItem,
} from "./analysisTypes";
import { getMonthsInPeriod } from "./getAnalysisPeriod";

type TransactionRecord = {
  type: "Income" | "Expense";
  amount: number;
  category: string;
  date: Date;
};

type BudgetRecord = {
  category: string;
  limit: number;
  month: number;
  year: number;
};

type GoalRecord = {
  targetAmount: number;
  currentAmount: number;
  completed: boolean;
};

type InvestmentRecord = {
  type: string;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
};

function round(value: number) {
  return Number(value.toFixed(2));
}

function getMonthKey(date: Date) {
  const value = new Date(date);

  return `${value.getUTCFullYear()}-${String(
    value.getUTCMonth() + 1
  ).padStart(2, "0")}`;
}

export async function getAnalysisData(
  userId: string,
  period: AnalysisPeriod
): Promise<AnalysisResponse> {
  await connectDB();

  const months = getMonthsInPeriod(period);

  const monthQuery = months.map(({ month, year }) => ({
    month,
    year,
  }));

  const [
    transactionDocuments,
    budgetDocuments,
    goalDocuments,
    investmentDocuments,
  ] = await Promise.all([
    Transaction.find({
      userId,
      date: {
        $gte: period.start,
        $lt: period.endExclusive,
      },
    }).lean(),

    Budget.find({
      userId,
      $or: monthQuery,
    }).lean(),

    Goal.find({
      userId,
    }).lean(),

    Investment.find({
      userId,
    }).lean(),
  ]);

  const transactions =
    transactionDocuments as unknown as TransactionRecord[];

  const budgets =
    budgetDocuments as unknown as BudgetRecord[];

  const goals = goalDocuments as unknown as GoalRecord[];

  const investments =
    investmentDocuments as unknown as InvestmentRecord[];

  let income = 0;
  let expenses = 0;

  const expenseByCategory = new Map<string, number>();
  const trendByMonth = new Map<
    string,
    IncomeExpenseTrendItem
  >();

  for (const month of months) {
    trendByMonth.set(month.key, {
      label: month.label,
      income: 0,
      expenses: 0,
      savings: 0,
    });
  }

  for (const transaction of transactions) {
    const amount = Number(transaction.amount) || 0;
    const monthKey = getMonthKey(transaction.date);

    const trend = trendByMonth.get(monthKey);

    if (transaction.type === "Income") {
      income += amount;

      if (trend) {
        trend.income += amount;
      }

      continue;
    }

    if (transaction.type === "Expense") {
      expenses += amount;

      expenseByCategory.set(
        transaction.category,
        (expenseByCategory.get(transaction.category) || 0) +
          amount
      );

      if (trend) {
        trend.expenses += amount;
      }
    }
  }

  const savings = income - expenses;

  const savingsRate =
    income > 0 ? (savings / income) * 100 : 0;

  const expenseBreakdown = [...expenseByCategory.entries()]
    .map(([category, amount]) => ({
      category,
      amount: round(amount),
      percentage:
        expenses > 0
          ? round((amount / expenses) * 100)
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const incomeExpenseTrend = months.map((month) => {
    const trend = trendByMonth.get(month.key)!;

    return {
      ...trend,
      income: round(trend.income),
      expenses: round(trend.expenses),
      savings: round(trend.income - trend.expenses),
    };
  });

  const savingsTrend = incomeExpenseTrend.map(
    ({ label, savings: monthlySavings }) => ({
      label,
      savings: monthlySavings,
    })
  );

  const budgetedAmount = budgets.reduce(
    (total, budget) => total + (Number(budget.limit) || 0),
    0
  );

  const budgetCategories = new Set(
    budgets.map((budget) => budget.category)
  );

  const budgetUsed = [...expenseByCategory.entries()]
    .filter(([category]) => budgetCategories.has(category))
    .reduce((total, [, amount]) => total + amount, 0);

  const goalsSummary = goals.reduce(
    (result, goal) => ({
      totalGoals: result.totalGoals + 1,
      completedGoals:
        result.completedGoals +
        (goal.completed ? 1 : 0),
      targetAmount:
        result.targetAmount +
        (Number(goal.targetAmount) || 0),
      savedAmount:
        result.savedAmount +
        (Number(goal.currentAmount) || 0),
    }),
    {
      totalGoals: 0,
      completedGoals: 0,
      targetAmount: 0,
      savedAmount: 0,
    }
  );

  const overallProgress =
    goalsSummary.targetAmount > 0
      ? Math.min(
          (goalsSummary.savedAmount /
            goalsSummary.targetAmount) *
            100,
          100
        )
      : 0;

  const totalInvested = investments.reduce(
    (total, investment) =>
      total + (Number(investment.totalInvested) || 0),
    0
  );

  const investmentValue = investments.reduce(
    (total, investment) =>
      total + (Number(investment.currentValue) || 0),
    0
  );

  const investmentProfitLoss = investments.reduce(
    (total, investment) =>
      total + (Number(investment.profitLoss) || 0),
    0
  );

  const investmentByType = new Map<
    string,
    {
      amount: number;
      investedAmount: number;
      profitLoss: number;
    }
  >();

  for (const investment of investments) {
    const current = investmentByType.get(investment.type) || {
      amount: 0,
      investedAmount: 0,
      profitLoss: 0,
    };

    current.amount +=
      Number(investment.currentValue) || 0;

    current.investedAmount +=
      Number(investment.totalInvested) || 0;

    current.profitLoss +=
      Number(investment.profitLoss) || 0;

    investmentByType.set(investment.type, current);
  }

  const investmentDistribution: InvestmentDistributionItem[] =
    [...investmentByType.entries()]
      .map(([type, values]) => ({
        type,
        amount: round(values.amount),
        investedAmount: round(values.investedAmount),
        profitLoss: round(values.profitLoss),
        percentage:
          investmentValue > 0
            ? round(
                (values.amount / investmentValue) * 100
              )
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

  const investmentReturnPercentage =
    totalInvested > 0
      ? (investmentProfitLoss / totalInvested) * 100
      : 0;

  return {
    success: true,

    period: {
      key: period.key,
      label: period.label,
      from: period.from,
      to: period.to,
    },

    summary: {
      income: round(income),
      expenses: round(expenses),
      savings: round(savings),
      savingsRate: round(savingsRate),

      budgetedAmount: round(budgetedAmount),
      budgetUsed: round(budgetUsed),

      currentNetWorth: null,

      investmentValue: round(investmentValue),
      totalInvested: round(totalInvested),
      investmentProfitLoss: round(investmentProfitLoss),
      investmentReturnPercentage: round(
        investmentReturnPercentage
      ),
    },

    expenseBreakdown,

    incomeExpenseTrend,

    savingsTrend,

    investmentDistribution,

    goals: {
      totalGoals: goalsSummary.totalGoals,
      completedGoals: goalsSummary.completedGoals,
      targetAmount: round(goalsSummary.targetAmount),
      savedAmount: round(goalsSummary.savedAmount),
      overallProgress: round(overallProgress),
    },

    netWorthTrend: [],

    dataStatus: {
      hasTransactions: transactions.length > 0,
      hasBudgets: budgets.length > 0,
      hasGoals: goals.length > 0,
      hasInvestments: investments.length > 0,
      hasAssets: false,
      hasLiabilities: false,
      hasNetWorthHistory: false,
    },
  };
}