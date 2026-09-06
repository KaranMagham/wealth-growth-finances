import questionDataset from "./questionDataset.json";
import type { ConversationFacts } from "./conversationContext";

export type QuestionRecord = {
  id: string;
  question: string;
  intent: string;
  category: string;
  subcategory: string;
  expectedFacts: readonly string[];
  calculationType: string;
  scenarioId: string;
  dataSources: readonly string[];
};

export const QUESTION_LIBRARY = questionDataset as QuestionRecord[];

const stopWords = new Set([
  "a", "an", "and", "am", "are", "can", "do", "for", "how", "i", "in", "is", "it",
  "me", "my", "of", "on", "or", "should", "the", "this", "to", "what", "when", "with",
]);

function tokenize(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 1 && !stopWords.has(token))
  );
}

function similarity(question: string, record: QuestionRecord) {
  const queryTokens = tokenize(question);
  const recordTokens = tokenize(record.question);
  if (queryTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of queryTokens) {
    if (recordTokens.has(token)) overlap += 1;
  }

  return overlap / queryTokens.size;
}

function factBoost(record: QuestionRecord, facts: ConversationFacts) {
  let score = 0;
  if (facts.topic === "purchase" && record.scenarioId === "purchase_monthly_saving") score += 0.4;
  if (facts.questionType === "affordability_now" && record.scenarioId === "affordability") score += 0.8;
  if (facts.targetAmount && record.expectedFacts.includes("targetAmount")) score += 0.15;
  if (facts.timelineMonths && record.expectedFacts.includes("timelineMonths")) score += 0.15;
  if (facts.expenseCategory && record.expectedFacts.includes("expenseCategory")) score += 0.1;
  return score;
}

function hasAffordabilitySignal(question: string) {
  return /can i afford|affordable for me|can i comfortably buy|within my budget|purchase affordable|finances handle|will i be able to afford|manage this purchase|can i buy/i.test(question);
}

function hasMonthlySavingSignal(question: string) {
  return /how much should i save|how much do i need to save|monthly saving|save every month|save per month|required monthly saving|put aside every month|monthly contribution/i.test(question);
}

export function matchQuestionScenario(
  question: string,
  facts: ConversationFacts
) {
  const candidateRecords = hasAffordabilitySignal(question) || facts.questionType === "affordability_now"
    ? QUESTION_LIBRARY.filter((record) => record.scenarioId === "affordability")
    : hasMonthlySavingSignal(question)
      ? QUESTION_LIBRARY.filter((record) => record.scenarioId === "purchase_monthly_saving")
      : QUESTION_LIBRARY;
  let bestRecord: QuestionRecord | null = null;
  let bestScore = 0;

  for (const record of candidateRecords) {
    const score = similarity(question, record) + factBoost(record, facts);
    if (score > bestScore) {
      bestScore = score;
      bestRecord = record;
    }
  }

  if (facts.topic === "purchase" && bestRecord?.scenarioId === "purchase_monthly_saving") {
    return bestRecord;
  }

  return bestScore >= 0.2 ? bestRecord : null;
}

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function buildScenarioAnswer(
  scenario: QuestionRecord,
  facts: ConversationFacts
) {
  if (scenario.scenarioId !== "purchase_monthly_saving") return null;

  const item = facts.purchaseItem || facts.itemName;
  const targetAmount = facts.targetAmount ?? facts.purchasePrice;
  const timelineMonths = facts.timelineMonths;

  if (!targetAmount && timelineMonths) {
    return item
      ? `What is the target price for the ${item}? I can calculate the monthly saving needed over ${timelineMonths} months.`
      : `What is the target purchase price? I can calculate the monthly saving needed over ${timelineMonths} months.`;
  }

  if (targetAmount && !timelineMonths) {
    return `Your target is ${formatCurrency(targetAmount)}${item ? ` for the ${item}` : ""}. When do you want to reach it? Tell me the timeline and I will calculate the required monthly saving.`;
  }

  if (targetAmount && typeof timelineMonths === "number" && timelineMonths > 0) {
    return `You would need to save approximately ${formatCurrency(
      targetAmount / timelineMonths
    )} per month for ${timelineMonths} months to reach your ${formatCurrency(
      targetAmount
    )}${item ? ` ${item}` : " purchase"} target.`;
  }

  return null;
}
