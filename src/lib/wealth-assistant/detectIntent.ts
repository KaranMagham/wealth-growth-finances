import type { WealthAssistantIntent } from "./assistantTypes";

export interface DetectedIntent {
  intent: WealthAssistantIntent;
  confidence: "high" | "medium" | "low";
  purchasePrice?: number;
  itemName?: string;
}

export function extractAmount(
  question: string
): number | undefined {
  const normalized = question
    .toLowerCase()
    .replace(/,/g, "");

  const amountWithUnitMatch = normalized.match(
    /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|k)\b/i
  );

  if (amountWithUnitMatch) {
    const amount = Number(
      amountWithUnitMatch[1]
    );
    const unit =
      amountWithUnitMatch[2].toLowerCase();

    if (!Number.isFinite(amount)) {
      return undefined;
    }

    if (unit === "crore" || unit === "cr") {
      return amount * 10000000;
    }

    if (unit === "lakh" || unit === "lac") {
      const remainingText = normalized.slice(
        (amountWithUnitMatch.index ?? 0) +
          amountWithUnitMatch[0].length
      );
      const thousandMatch = remainingText.match(
        /^\s*(?:and\s+)?(\d+(?:\.\d+)?)\s*thousand\b/i
      );
      const thousand = thousandMatch
        ? Number(thousandMatch[1]) * 1000
        : 0;

      return amount * 100000 + thousand;
    }

    return amount * 1000;
  }

  const lakhWordsMatch = normalized.match(
    /^(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*lakh\s*(?:and\s+)?(\d+(?:\.\d+)?)\s*thousand\b/i
  );

  if (lakhWordsMatch) {
    return (
      Number(lakhWordsMatch[1]) * 100000 +
      Number(lakhWordsMatch[2]) * 1000
    );
  }

  const formattedRupeeMatch = question.match(
    /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/i
  );

  if (formattedRupeeMatch) {
    const amount = Number(
      formattedRupeeMatch[1].replace(/,/g, "")
    );

    return Number.isFinite(amount)
      ? amount
      : undefined;
  }

  const bareAmountMatch = normalized.match(/\b(\d{4,})\b/);
  if (bareAmountMatch) {
    const amount = Number(bareAmountMatch[1]);
    return Number.isFinite(amount) ? amount : undefined;
  }

  return undefined;
}

function extractPurchasePrice(question: string) {
  return extractAmount(question);
}

function containsAny(
  question: string,
  phrases: readonly string[]
) {
  return phrases.some((phrase) =>
    question.includes(phrase)
  );
}

export function detectIntent(
  question: string
): DetectedIntent {
  const normalized = question
    .toLowerCase()
    .trim();

  if (
    containsAny(normalized, [
      "can i afford",
      "should i buy",
      "should i purchase",
      "can i buy",
      "afford this",
      "afford it",
      "financially afford",
    ])
  ) {
    return {
      intent: "affordability",
      confidence: "high",
      purchasePrice:
        extractPurchasePrice(question),
    };
  }

  if (
    containsAny(normalized, [
      "travel",
      "trip",
      "vacation",
      "holiday",
      "himalaya",
      "himalayas",
      "go to",
      "buy a",
      "buy an",
      "purchase a",
      "purchase an",
    ]) &&
    containsAny(normalized, [
      "plan",
      "want",
      "save",
      "afford",
      "cost",
      "buy",
      "purchase",
      "how much",
    ])
  ) {
    return {
      intent: "financial_planning",
      confidence: "medium",
      purchasePrice: extractPurchasePrice(question),
    };
  }

  if (
    containsAny(normalized, [
      "where am i spending",
      "spending more",
      "spending too much",
      "biggest expense",
      "largest expense",
      "top expenses",
      "expense breakdown",
      "spending categories",
      "spent this month",
      "spent last month",
      "how much did i spend",
      "wasting money",
      "reduce expenses",
    ])
  ) {
    return {
      intent: "spending_analysis",
      confidence: "high",
    };
  }

  if (
    containsAny(normalized, [
      "save",
      "saving",
      "savings rate",
      "cash flow",
      "monthly surplus",
      "saving enough",
      "increase my savings",
    ])
  ) {
    return {
      intent: "savings_analysis",
      confidence: "high",
    };
  }

  if (
    containsAny(normalized, [
      "budget",
      "over budget",
      "under budget",
      "budget used",
      "budget left",
      "overspending",
      "underspending",
    ])
  ) {
    return {
      intent: "budget_analysis",
      confidence: "high",
    };
  }

  if (
    containsAny(normalized, [
      "goal",
      "target",
      "goal plan",
      "goal progress",
      "travel plan",
      "trip plan",
      "save for",
      "reach my goal",
      "prioritize my goals",
    ])
  ) {
    return {
      intent: "goal_progress",
      confidence: "high",
    };
  }

  if (
    containsAny(normalized, [
      "investment",
      "investments",
      "portfolio",
      "stock",
      "stocks",
      "mutual fund",
      "mutual funds",
      "etf",
      "gold",
      "bond",
      "bonds",
      "fixed deposit",
      "fd",
      "crypto",
      "bitcoin",
    ])
  ) {
    return {
      intent: "investment_analysis",
      confidence: "high",
    };
  }

  if (
    containsAny(normalized, [
      "what if",
      "scenario",
      "if i save",
      "if my income",
      "if my expenses",
      "if my investments",
      "how much faster",
    ])
  ) {
    return {
      intent: "scenario_analysis",
      confidence: "high",
    };
  }

  if (
    containsAny(normalized, [
      "financial health",
      "financially healthy",
      "financial plan",
      "action plan",
      "financial priority",
      "what should i do",
      "what should i improve",
      "financial review",
      "review my finances",
      "biggest financial problem",
      "biggest financial risk",
    ])
  ) {
    return {
      intent: "financial_planning",
      confidence: "high",
    };
  }

  if (
    containsAny(normalized, [
      "how much did i earn",
      "my income",
      "average income",
      "average expense",
      "monthly expense",
      "cash flow",
      "money left",
      "income trend",
      "expense trend",
    ])
  ) {
    return {
      intent: "cash_flow_analysis",
      confidence: "medium",
    };
  }

  if (
    containsAny(normalized, [
      "what can you help",
      "what data can you see",
      "how did you calculate",
      "what assumptions",
      "are you a financial advisor",
      "can you predict",
      "what information do you need",
    ])
  ) {
    return {
      intent: "general_financial_question",
      confidence: "high",
    };
  }

  return {
    intent: "general_financial_question",
    confidence: "low",
  };
}