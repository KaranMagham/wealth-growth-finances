import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Budget from "@/models/Budget";
import Goal from "@/models/Goal";
import Investment from "@/models/Investment";

import type {
  AnalysisPeriod,
  AnalysisResponse,
  BudgetAnalysisItem,
  GoalAnalysisItem,
  IncomeExpenseTrendItem,
  InvestmentAnalysisItem,
  InvestmentDistributionItem,
  TransactionAnalysisItem,
} from "./analysisTypes";

import { getMonthsInPeriod } from "./getAnalysisPeriod";

type TransactionRecord = {
  _id?: unknown;
  type: "Income" | "Expense";
  amount: number;
  category?: string;
  description?: string;
  merchant?: string;
  title?: string;
  date: Date | string;
};

type BudgetRecord = {
  category: string;
  limit: number;
  month: number;
  year: number;
};

type GoalRecord = {
  _id?: unknown;
  name?: string;
  title?: string;
  targetAmount: number;
  currentAmount?: number;
  savedAmount?: number;
  deadline?: Date | string;
  completed: boolean;
};

type InvestmentRecord = {
  _id?: unknown;
  name?: string;
  type: string;
  symbol?: string;
  quantity?: number;
  averageBuyPrice?: number;
  currentPrice?: number;
  purchaseDate?: Date | string;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
};

function round(value: number) {
  return Number(value.toFixed(2));
}

function toDate(value: Date | string | undefined) {
  if (!value) {
    return new Date(0);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? new Date(0)
    : date;
}

function toId(value: unknown, fallback: string) {
  return value ? String(value) : fallback;
}

function formatDate(value: Date | string) {
  return toDate(value).toISOString();
}

function getMonthKey(date: Date | string) {
  const value = toDate(date);

  return `${value.getUTCFullYear()}-${String(
    value.getUTCMonth() + 1
  ).padStart(2, "0")}`;
}

function getDayDifference(
  start: Date,
  end: Date
) {
  const milliseconds =
    end.getTime() - start.getTime();

  return Math.max(
    1,
    Math.ceil(milliseconds / 86400000)
  );
}

function getMerchant(transaction: TransactionRecord) {
  return (
    transaction.merchant?.trim() ||
    transaction.description?.trim() ||
    transaction.title?.trim() ||
    transaction.category?.trim() ||
    "Unknown"
  );
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
    })
      .sort({ date: -1 })
      .lean(),

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

  const goals =
    goalDocuments as unknown as GoalRecord[];

  const investments =
    investmentDocuments as unknown as InvestmentRecord[];

  let income = 0;
  let expenses = 0;

  let incomeTransactionCount = 0;
  let expenseTransactionCount = 0;

  const expenseByCategory = new Map<
    string,
    number
  >();

  const incomeBySource = new Map<
    string,
    {
      amount: number;
      occurrenceCount: number;
    }
  >();

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

  const transactionItems: TransactionAnalysisItem[] =
    transactions.map((transaction, index) => {
      const type = transaction.type;
      const category =
        transaction.category?.trim() ||
        "Uncategorized";
      const merchant = getMerchant(transaction);

      return {
        id: toId(
          transaction._id,
          `${type}-${index}`
        ),
        type,
        amount: round(
          Number(transaction.amount) || 0
        ),
        category,
        description:
          transaction.description?.trim() ||
          transaction.title?.trim() ||
          "",
        merchant,
        date: formatDate(transaction.date),
      };
    });

  for (const transaction of transactions) {
    const amount = Number(transaction.amount) || 0;
    const monthKey = getMonthKey(transaction.date);
    const trend = trendByMonth.get(monthKey);

    if (transaction.type === "Income") {
      income += amount;
      incomeTransactionCount += 1;

      const source =
        transaction.category?.trim() ||
        transaction.description?.trim() ||
        transaction.title?.trim() ||
        "Other income";

      const current = incomeBySource.get(source) || {
        amount: 0,
        occurrenceCount: 0,
      };

      current.amount += amount;
      current.occurrenceCount += 1;
      incomeBySource.set(source, current);

      if (trend) {
        trend.income += amount;
      }

      continue;
    }

    if (transaction.type === "Expense") {
      expenses += amount;
      expenseTransactionCount += 1;

      const category =
        transaction.category?.trim() ||
        "Uncategorized";

      expenseByCategory.set(
        category,
        (expenseByCategory.get(category) || 0) +
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

  const expenseBreakdown = [
    ...expenseByCategory.entries(),
  ]
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
      savings: round(
        trend.income - trend.expenses
      ),
    };
  });

  const savingsTrend = incomeExpenseTrend.map(
    ({ label, savings: monthlySavings }) => ({
      label,
      savings: monthlySavings,
    })
  );

  const periodDays = getDayDifference(
    period.start,
    period.endExclusive
  );

  const averageDailySpending =
    expenses / periodDays;

  const averageWeeklySpending =
    expenses / Math.max(1, periodDays / 7);

  const averageMonthlySpending =
    expenses /
    Math.max(1, months.length);

  const sortedExpenses = transactionItems
    .filter(
      (transaction) =>
        transaction.type === "Expense"
    )
    .sort((a, b) => b.amount - a.amount);

  const biggestExpenses = sortedExpenses.slice(
    0,
    10
  );

  const recurringMap = new Map<
    string,
    {
      category: string;
      merchant: string;
      amount: number;
      occurrenceCount: number;
      lastDate: string;
    }
  >();

  for (const transaction of sortedExpenses) {
    const key = `${transaction.category}:${transaction.merchant}`;

    const current = recurringMap.get(key);

    if (!current) {
      recurringMap.set(key, {
        category: transaction.category,
        merchant: transaction.merchant,
        amount: transaction.amount,
        occurrenceCount: 1,
        lastDate: transaction.date,
      });

      continue;
    }

    current.amount += transaction.amount;
    current.occurrenceCount += 1;

    if (
      new Date(transaction.date).getTime() >
      new Date(current.lastDate).getTime()
    ) {
      current.lastDate = transaction.date;
    }
  }

  const recurringExpenses = [
    ...recurringMap.values(),
  ]
    .filter((item) => item.occurrenceCount >= 2)
    .map((item) => ({
      ...item,
      amount: round(item.amount),
      averageAmount: round(
        item.amount / item.occurrenceCount
      ),
    }))
    .sort((a, b) => b.amount - a.amount);

  const incomeSources = [
    ...incomeBySource.entries(),
  ]
    .map(([source, value]) => ({
      source,
      amount: round(value.amount),
      occurrenceCount: value.occurrenceCount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const budgetedAmount = budgets.reduce(
    (total, budget) =>
      total + (Number(budget.limit) || 0),
    0
  );

  const budgetUsed = budgets.reduce(
    (total, budget) => {
      const categorySpent =
        expenseByCategory.get(budget.category) ||
        0;

      return total + categorySpent;
    },
    0
  );

  const budgetBreakdown: BudgetAnalysisItem[] =
  budgets
    .map((budget): BudgetAnalysisItem => {
        const limit =
          Number(budget.limit) || 0;

        const spent =
          expenseByCategory.get(budget.category) ||
          0;

        const remaining = limit - spent;

        const usagePercentage =
          limit > 0 ? (spent / limit) * 100 : 0;

        const status =
          usagePercentage >= 100
            ? "exceeded"
            : usagePercentage >= 80
              ? "nearly_exhausted"
              : "under_budget";

        return {
          category: budget.category,
          limit: round(limit),
          spent: round(spent),
          remaining: round(remaining),
          usagePercentage: round(
            usagePercentage
          ),
          status,
        };
      })
      .sort(
        (a, b) =>
          b.usagePercentage -
          a.usagePercentage
      );

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
        (Number(
          goal.currentAmount ??
            goal.savedAmount
        ) || 0),
    }),
    {
      totalGoals: 0,
      completedGoals: 0,
      targetAmount: 0,
      savedAmount: 0,
    }
  );

  const goalItems: GoalAnalysisItem[] = goals.map(
    (goal, index) => {
      const targetAmount =
        Number(goal.targetAmount) || 0;

      const currentAmount =
        Number(
          goal.currentAmount ??
            goal.savedAmount
        ) || 0;

      const remainingAmount = Math.max(
        0,
        targetAmount - currentAmount
      );

      const progressPercentage =
        targetAmount > 0
          ? Math.min(
              100,
              (currentAmount / targetAmount) *
                100
            )
          : 0;

      return {
        id: toId(
          goal._id,
          `goal-${index}`
        ),
        name:
          goal.name?.trim() ||
          goal.title?.trim() ||
          "Unnamed goal",
        targetAmount: round(targetAmount),
        currentAmount: round(currentAmount),
        remainingAmount: round(
          remainingAmount
        ),
        progressPercentage: round(
          progressPercentage
        ),
        deadline: goal.deadline
          ? formatDate(goal.deadline)
          : undefined,
        completed: Boolean(goal.completed),
      };
    }
  );

  const overallProgress =
    goalsSummary.targetAmount > 0
      ? Math.min(
          100,
          (goalsSummary.savedAmount /
            goalsSummary.targetAmount) *
            100
        )
      : 0;

  const totalInvested = investments.reduce(
    (total, investment) =>
      total +
      (Number(investment.totalInvested) || 0),
    0
  );

  const investmentValue = investments.reduce(
    (total, investment) =>
      total +
      (Number(investment.currentValue) || 0),
    0
  );

  const investmentProfitLoss =
    investments.reduce(
      (total, investment) =>
        total +
        (Number(investment.profitLoss) || 0),
      0
    );

  const investmentItems: InvestmentAnalysisItem[] =
    investments.map((investment, index) => {
      const invested =
        Number(investment.totalInvested) || 0;

      const currentValue =
        Number(investment.currentValue) || 0;

      const profitLoss =
        Number(investment.profitLoss) || 0;

      return {
        id: toId(
          investment._id,
          `investment-${index}`
        ),
        name:
          investment.name?.trim() ||
          "Unnamed investment",
        type: investment.type,
        symbol: investment.symbol,
        quantity:
          Number(investment.quantity) || 0,
        averageBuyPrice:
          Number(
            investment.averageBuyPrice
          ) || 0,
        currentPrice:
          Number(investment.currentPrice) || 0,
        totalInvested: round(invested),
        currentValue: round(currentValue),
        profitLoss: round(profitLoss),
        returnPercentage:
          invested > 0
            ? round(
                (profitLoss / invested) * 100
              )
            : 0,
        purchaseDate: investment.purchaseDate
          ? formatDate(
              investment.purchaseDate
            )
          : undefined,
      };
    });

  const investmentByType = new Map<
    string,
    {
      amount: number;
      investedAmount: number;
      profitLoss: number;
    }
  >();

  for (const investment of investments) {
    const current =
      investmentByType.get(
        investment.type
      ) || {
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

    investmentByType.set(
      investment.type,
      current
    );
  }

  const investmentDistribution: InvestmentDistributionItem[] =
    [...investmentByType.entries()]
      .map(([type, values]) => ({
        type,
        amount: round(values.amount),
        investedAmount: round(
          values.investedAmount
        ),
        profitLoss: round(
          values.profitLoss
        ),
        percentage:
          investmentValue > 0
            ? round(
                (values.amount /
                  investmentValue) *
                  100
              )
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

  const investmentReturnPercentage =
    totalInvested > 0
      ? (investmentProfitLoss /
          totalInvested) *
        100
      : 0;

  const budgetRemaining =
    budgetedAmount - budgetUsed;

  const budgetUsagePercentage =
    budgetedAmount > 0
      ? (budgetUsed / budgetedAmount) * 100
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

      budgetedAmount: round(
        budgetedAmount
      ),
      budgetUsed: round(budgetUsed),
      budgetRemaining: round(
        budgetRemaining
      ),
      budgetUsagePercentage: round(
        budgetUsagePercentage
      ),

      currentNetWorth: null,

      investmentValue: round(
        investmentValue
      ),
      totalInvested: round(totalInvested),
      investmentProfitLoss: round(
        investmentProfitLoss
      ),
      investmentReturnPercentage: round(
        investmentReturnPercentage
      ),

      transactionCount: transactions.length,
      expenseTransactionCount,
      incomeTransactionCount,

      averageDailySpending: round(
        averageDailySpending
      ),
      averageWeeklySpending: round(
        averageWeeklySpending
      ),
      averageMonthlySpending: round(
        averageMonthlySpending
      ),
    },

    expenseBreakdown,

    transactions: transactionItems,

    biggestExpenses,

    recurringExpenses,

    incomeSources,

    budgetBreakdown,

    incomeExpenseTrend,

    savingsTrend,

    investmentDistribution,

    investments: investmentItems,

    goals: {
      totalGoals: goalsSummary.totalGoals,
      completedGoals:
        goalsSummary.completedGoals,
      targetAmount: round(
        goalsSummary.targetAmount
      ),
      savedAmount: round(
        goalsSummary.savedAmount
      ),
      remainingAmount: round(
        Math.max(
          0,
          goalsSummary.targetAmount -
            goalsSummary.savedAmount
        )
      ),
      overallProgress: round(
        overallProgress
      ),
      items: goalItems,
    },

    netWorthTrend: [],

    dataStatus: {
      hasTransactions:
        transactions.length > 0,
      hasBudgets: budgets.length > 0,
      hasGoals: goals.length > 0,
      hasInvestments:
        investments.length > 0,
      hasAssets: false,
      hasLiabilities: false,
      hasNetWorthHistory: false,
    },
  };
}