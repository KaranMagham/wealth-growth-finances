import type {
  AffordabilityInput,
  AffordabilityResult,
  AffordabilityStatus,
} from "./assistantTypes";

function round(value: number | null) {
  return value === null
    ? null
    : Math.round(value * 100) / 100;
}

export function calculateAffordability(
  input: AffordabilityInput
): AffordabilityResult {
  const {
    purchasePrice,
    availableCash,
    averageMonthlyExpenses,
    averageMonthlySavings,
    essentialMonthlyExpenses,
    upcomingGoalRequirement,
  } = input;

  const cashAfterPurchase =
    availableCash === null ? null : availableCash - purchasePrice;

  const recommendedMinimumCashBuffer =
    Math.max(essentialMonthlyExpenses, averageMonthlyExpenses) *
    3;

  const monthsOfExpensesAfterPurchase =
    cashAfterPurchase !== null && averageMonthlyExpenses > 0
      ? cashAfterPurchase / averageMonthlyExpenses
      : null;

  const monthsToRebuildPurchaseAmount =
    averageMonthlySavings > 0
      ? purchasePrice / averageMonthlySavings
      : null;

  let status: AffordabilityStatus;

  if (cashAfterPurchase === null) {
    status = "possible_with_caution";
  } else if (cashAfterPurchase < 0) {
    status = "not_recommended";
  } else if (
    cashAfterPurchase < recommendedMinimumCashBuffer ||
    cashAfterPurchase < upcomingGoalRequirement
  ) {
    status = "possible_with_caution";
  } else {
    status = "comfortable";
  }

  const reasons: string[] = [];

  if (cashAfterPurchase === null) {
    reasons.push(
      "No account balance is recorded, so this estimate uses monthly surplus and cannot confirm whether you have enough cash today."
    );
  } else if (cashAfterPurchase < 0) {
    reasons.push(
      "The purchase price is higher than the available cash."
    );
  } else {
    reasons.push(
      `You would have ₹${Math.round(
        cashAfterPurchase
      ).toLocaleString("en-IN")} remaining after the purchase.`
    );
  }

  if (
    monthsOfExpensesAfterPurchase !== null &&
    monthsOfExpensesAfterPurchase < 3
  ) {
    reasons.push(
      "The remaining cash would cover less than three months of average expenses."
    );
  }

  if (
    upcomingGoalRequirement > 0 &&
    cashAfterPurchase !== null &&
    cashAfterPurchase < upcomingGoalRequirement
  ) {
    reasons.push(
      "The purchase could reduce the cash available for upcoming goals."
    );
  }

  if (
    monthsToRebuildPurchaseAmount !== null
  ) {
    reasons.push(
      `At your current savings rate, rebuilding this amount would take approximately ${monthsToRebuildPurchaseAmount.toFixed(
        1
      )} months.`
    );
  }

  return {
    status,
    requestedPrice: purchasePrice,
    cashAfterPurchase: round(cashAfterPurchase),
    monthsOfExpensesAfterPurchase:
      round(monthsOfExpensesAfterPurchase),
    monthsToRebuildPurchaseAmount:
      round(monthsToRebuildPurchaseAmount),
    recommendedMinimumCashBuffer,
    reasons,
    assumptions: [
      "No account balance was available; monthly surplus is not treated as cash on hand.",
      "A minimum cash buffer of three months of expenses is used.",
      "This is an informational estimate, not guaranteed financial advice.",
    ],
  };
}