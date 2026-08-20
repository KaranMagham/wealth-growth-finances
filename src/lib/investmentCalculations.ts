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

export type BondInterestFrequency =
  | "Monthly"
  | "Quarterly"
  | "Half-yearly"
  | "Yearly";

export interface BondCalculationInput {
  quantity: number;
  buyPrice: number;
  faceValue: number;
  couponRate: number;
  purchaseDate: Date;
  maturityDate: Date;
  interestFrequency: BondInterestFrequency;
}

export interface BondCalculationResult
  extends InvestmentCalculationResult {
  estimatedInterest: number;
  maturityValue: number;
  yearsToMaturity: number;
  periodsPerYear: number;
}

export function calculateBondValues({
  quantity,
  buyPrice,
  faceValue,
  couponRate,
  purchaseDate,
  maturityDate,
  interestFrequency,
}: BondCalculationInput): BondCalculationResult {
  const millisecondsPerYear =
    1000 * 60 * 60 * 24 * 365.25;

  const purchaseTime = purchaseDate.getTime();
  const maturityTime = maturityDate.getTime();

  const yearsToMaturity = Math.max(
    (maturityTime - purchaseTime) /
    millisecondsPerYear,
    0
  );

  const periodsPerYear =
    interestFrequency === "Monthly"
      ? 12
      : interestFrequency === "Quarterly"
        ? 4
        : interestFrequency === "Half-yearly"
          ? 2
          : 1;

  const annualInterestPerBond =
    faceValue * (couponRate / 100);

  const estimatedInterest =
    annualInterestPerBond *
    quantity *
    yearsToMaturity;

  const maturityValue = faceValue * quantity;
  const totalInvested = buyPrice * quantity;
  const currentValue =
    maturityValue + estimatedInterest;
  const profitLoss =
    currentValue - totalInvested;

  const returnPercentage =
    totalInvested > 0
      ? (profitLoss / totalInvested) * 100
      : 0;

  return {
    totalInvested,
    currentValue,
    profitLoss,
    returnPercentage,
    estimatedInterest,
    maturityValue,
    yearsToMaturity,
    periodsPerYear,
  };
}

export function getInvestmentStatus(
  profitLoss: number
) {
  if (profitLoss > 0) {
    return "Profit" as const;
  }

  if (profitLoss < 0) {
    return "Loss" as const;
  }

  return "No Change" as const;
}