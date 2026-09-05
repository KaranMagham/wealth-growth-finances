import {
  detectIntent,
  extractAmount,
  type DetectedIntent,
} from "./detectIntent";

export type ConversationHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type ConversationQuestionType =
  | "affordability_now"
  | "required_monthly_saving"
  | "time_to_target"
  | "spending_analysis"
  | "budget_analysis"
  | "goal_planning"
  | "investment_analysis"
  | "contextual_follow_up"
  | "general_finance";

export type ConversationState = {
  topic?: string;
  purchaseItem?: string;
  purchasePrice?: number;
  monthlySaving?: number;
  targetAmount?: number;
  timelineMonths?: number;
  expenseCategory?: string;
  goalName?: string;
  questionType?: ConversationQuestionType;
  isContextualFollowUp?: boolean;
};

export type ConversationFacts = ConversationState & {
  itemName?: string;
  goalAmount?: number;
  goalMonths?: number;
};

function latestAssistant(history: ConversationHistoryItem[]) {
  return [...history].reverse().find((item) => item.role === "assistant")?.content.toLowerCase() || "";
}

function extractMonths(value: string) {
  const match = value.match(/(?:after|in|within|over|for)?\s*(\d+)\s*months?/i);
  return match ? Number(match[1]) : undefined;
}

function extractMonthlySaving(value: string) {
  if (!/(save|saving|set aside|put aside)/i.test(value)) return undefined;
  if (!/(monthly|per month|each month|every month|a month)/i.test(value)) return undefined;
  const savingText = value.slice(value.search(/save|saving|set aside|put aside/i));
  return extractAmount(savingText);
}

function extractPurchase(value: string) {
  if (!/(buy|purchase|afford|instead|want)/i.test(value)) return undefined;
  const amount = extractAmount(value);
  const itemMatch = value.match(/(?:buy|purchase|afford|want\s+(?:to\s+)?(?:buy|purchase)?|want)\s+(?:a|an|the)?\s*(?:₹|rs\.?|inr)?\s*(?:\d[\d,.]*\s*(?:crore|cr|lakh|lac|k|thousand)?\s*)?([a-z][a-z -]{1,30})/i);
  const item = itemMatch?.[1]?.trim().replace(/\s+(?:for|and|with|at)\s*$/i, "").replace(/\s+and\s+save.*$/i, "");
  if (!amount && !item) return undefined;
  return { item, amount };
}

function extractGoal(value: string) {
  const normalized = value.toLowerCase();
  if (!/(goal|trip|travel|himalaya|vacation|holiday|house|buy|purchase)/i.test(normalized)) return undefined;
  const amount = extractAmount(value);
  const goalName = normalized.includes("himalaya")
    ? "Himalaya trip"
    : normalized.includes("house")
      ? "house purchase"
      : normalized.match(/(?:for|to|want)\s+(?:a|an|the)?\s*([a-z][a-z ]{2,30})/i)?.[1]?.trim();
  return goalName ? { goalName, amount } : undefined;
}

function extractExpenseCategory(value: string) {
  return value.toLowerCase().match(/(?:spend|spent|spending|expense)[^?!.]*?\bon\s+([a-z][a-z ]+?)(?:\s+(?:this|last)\s+month)?[?!.]*$/i)?.[1]?.trim();
}

function isExplicitPurchase(value: string) {
  return ( /\b(?:buy|purchase|afford)\b/i.test(value) && Boolean(extractAmount(value)) ) || (/\bwant\b/i.test(value) && Boolean(extractAmount(value)) && /\b(?:house|car|bike|phone|laptop|gift)\b/i.test(value));
}

function resolveShortAnswer(value: string, state: ConversationState, previousAssistant: string) {
  const amount = extractAmount(value);
  const months = extractMonths(value);
  if (amount && /(?:save|saving|monthly|per month|target|amount|cost|price)/i.test(previousAssistant)) {
    if (/save|saving|monthly|per month/i.test(previousAssistant)) state.monthlySaving = amount;
    else if (state.goalName || state.topic === "goal") state.targetAmount = amount;
    else state.purchasePrice = amount;
  }
  if (months) state.timelineMonths = months;
}

function classifyQuestion(value: string, state: ConversationState, history: ConversationHistoryItem[]): ConversationQuestionType {
  const normalized = value.toLowerCase();
  if (/how many months|how long|take to|months will/i.test(normalized) && state.targetAmount && state.monthlySaving) return "time_to_target";
  if (/how much should i save|save monthly|per month|monthly saving/i.test(normalized) && state.targetAmount) return "required_monthly_saving";
  if (/can i afford|can i buy|affordability|afford/i.test(normalized)) return "affordability_now";
  if (/spend|spent|expense/.test(normalized)) return "spending_analysis";
  if (/budget/.test(normalized)) return "budget_analysis";
  if (/invest|stock|portfolio|mutual fund|gold|crypto/.test(normalized)) return "investment_analysis";
  if (state.isContextualFollowUp || history.length > 0 && /^(really|yes|no|it|that|after|in|₹|rs\.?|i can save)/i.test(normalized)) return "contextual_follow_up";
  return state.goalName || state.targetAmount ? "goal_planning" : "general_finance";
}

export function resolveConversationState(history: ConversationHistoryItem[], currentQuestion: string): ConversationState {
  const state: ConversationState = {};
  const previousAssistant = latestAssistant(history);
  const userMessages = history.filter((message) => message.role === "user");

  for (const message of [...userMessages, { role: "user" as const, content: currentQuestion }]) {
    const value = message.content.trim();
    const normalized = value.toLowerCase();
    const purchase = extractPurchase(value);
    const monthlySaving = extractMonthlySaving(value);
    const goal = extractGoal(value);

    if (isExplicitPurchase(value)) {
      state.purchaseItem = purchase?.item || state.purchaseItem;
      state.purchasePrice = purchase?.amount;
      if (purchase?.amount) state.targetAmount = purchase.amount;
      state.topic = "purchase";
    } else if (purchase?.item && /what about|instead/i.test(normalized)) {
      state.purchaseItem = purchase.item;
      state.purchasePrice = purchase.amount;
      state.topic = "purchase";
    }
    if (monthlySaving) state.monthlySaving = monthlySaving;
    if (goal?.goalName && goal.goalName !== "to buy a") {
      state.goalName = goal.goalName;
      state.topic = "goal";
      if (goal.amount) state.targetAmount = goal.amount;
    }
    const category = extractExpenseCategory(value);
    if (category) state.expenseCategory = category;
    const months = extractMonths(value);
    if (months) state.timelineMonths = months;
  }

  resolveShortAnswer(currentQuestion, state, previousAssistant);
  state.isContextualFollowUp = history.length > 0 && !isExplicitPurchase(currentQuestion) && (
    /^(really|yes|no|it|that|after|in|₹|rs\.?|i can save)/i.test(currentQuestion.trim()) ||
    /next month|after buying|how much should i keep/i.test(currentQuestion.toLowerCase())
  );
  state.questionType = classifyQuestion(currentQuestion, state, history);
  return state;
}

export function getConversationFacts(history: ConversationHistoryItem[], currentQuestion = ""): ConversationFacts {
  const state = resolveConversationState(history, currentQuestion);
  return { ...state, itemName: state.purchaseItem, goalAmount: state.targetAmount, goalMonths: state.timelineMonths };
}

export function applyCurrentPurchaseFacts(question: string, facts: ConversationFacts) {
  return { ...facts, ...resolveConversationState([], question) };
}

export function resolveConversationIntent(question: string, history: ConversationHistoryItem[], facts: ConversationFacts): DetectedIntent {
  const detected = detectIntent(question);
  if (facts.questionType === "affordability_now") return { ...detected, intent: "affordability", purchasePrice: facts.purchasePrice, itemName: facts.purchaseItem, confidence: "high" };
  if (facts.questionType === "time_to_target" || facts.questionType === "required_monthly_saving") return { ...detected, intent: "financial_planning", confidence: "high" };
  if (facts.questionType === "spending_analysis") return { ...detected, intent: "spending_analysis", confidence: "high" };
  if (facts.isContextualFollowUp) return { ...detected, intent: "financial_planning", confidence: "medium" };
  return detected;
}

export function isFinanceRelated(question: string, history: ConversationHistoryItem[]) {
  const normalized = question.toLowerCase();
  return Boolean(
    extractAmount(question) ||
    /afford|buy|purchase|save|saving|budget|spend|expense|income|invest|goal|financial|money|cash|emi|cost|price|worth|plan|travel|trip|house/.test(normalized) ||
    (history.length > 0 && /really|yes|no|it|that|after|in|next month/i.test(normalized))
  );
}
