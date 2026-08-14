export const BUDGET_PERIODS = ["monthly", "yearly"] as const;

export type BudgetPeriod = (typeof BUDGET_PERIODS)[number];

export type BudgetStatus = "normal" | "warning" | "exceeded";

export interface BudgetRecord {
    _id: string;
    userId?: string;
    category: string;
    limit: number;
    month: number;
    year: number;
    spent?: number;
    remaining?: number;
    percentageUsed?: number;
}

export function getBudgetStatus(
    percentageUsed: number
): BudgetStatus {
    if (percentageUsed >= 100) {
        return "exceeded";
    }

    if (percentageUsed >= 80) {
        return "warning";
    }

    return "normal";
}