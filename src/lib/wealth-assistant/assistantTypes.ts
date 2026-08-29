export type AffordabilityStatus =
  | "comfortable"
  | "possible_with_caution"
  | "not_recommended";

export interface AffordabilityInput {
  purchasePrice: number;
  availableCash: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  averageMonthlySavings: number;
  essentialMonthlyExpenses: number;
  upcomingGoalRequirement: number;
  existingBudgetCommitments: number;
  currentInvestments: number;
}

export interface AffordabilityResult {
  status: AffordabilityStatus;
  requestedPrice: number;
  cashAfterPurchase: number;
  monthsOfExpensesAfterPurchase: number | null;
  monthsToRebuildPurchaseAmount: number | null;
  recommendedMinimumCashBuffer: number;
  reasons: string[];
  assumptions: string[];
}

export type WealthAssistantIntent =
  | "affordability"
  | "spending_analysis"
  | "savings_analysis"
  | "budget_analysis"
  | "goal_progress"
  | "investment_analysis"
  | "scenario_analysis"
  | "financial_planning"
  | "cash_flow_analysis"
  | "general_financial_question"
  | "unsupported";