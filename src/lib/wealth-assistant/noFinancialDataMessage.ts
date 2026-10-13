export const NO_FINANCIAL_DATA_MESSAGE =
  "I could not find any recorded financial data for your account yet. Add a transaction, budget, goal, or investment, then ask me again.";

export function hasFinancialData(dataStatus: {
  hasTransactions: boolean;
  hasBudgets: boolean;
  hasGoals: boolean;
  hasInvestments: boolean;
}) {
  return Object.values(dataStatus).some(Boolean);
}
