export interface InvestmentCalculationInput {
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
}

export interface InvestmentCalculationResult {
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  returnPercentage: number;
}

export function calculateInvestmentValues({
  quantity,
  purchasePrice,
  currentPrice,
}: InvestmentCalculationInput): InvestmentCalculationResult {
  const totalInvested = quantity * purchasePrice;
  const currentValue = quantity * currentPrice;
  const profitLoss = currentValue - totalInvested;

  const returnPercentage =
    totalInvested > 0
      ? (profitLoss / totalInvested) * 100
      : 0;

  return {
    totalInvested,
    currentValue,
    profitLoss,
    returnPercentage,
  };
}

export function getInvestmentStatus(profitLoss: number) {
  if (profitLoss > 0) {
    return "Profit" as const;
  }

  if (profitLoss < 0) {
    return "Loss" as const;
  }

  return "No Change" as const;
}