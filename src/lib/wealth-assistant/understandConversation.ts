import OpenAI from "openai";

import type { FinancialContext } from "./buildFinancialContext";
import type { ConversationHistoryItem } from "./conversationContext";

export type ConversationUnderstanding = {
  isFinanceRelated: boolean;
  intent:
    | "affordability"
    | "spending_analysis"
    | "savings_analysis"
    | "budget_analysis"
    | "goal_planning"
    | "investment_analysis"
    | "cash_flow_analysis"
    | "general_financial_question"
    | "unsupported";
  confidence: "high" | "medium" | "low";
  reference: "purchase" | "goal" | "expense" | "investment" | "none";
  purchaseItem?: string;
  purchasePrice?: number;
  goalName?: string;
  goalAmount?: number;
  goalMonths?: number;
  expenseCategory?: string;
  needsClarification?: boolean;
};

interface UnderstandConversationInput {
  question: string;
  financialContext: FinancialContext;
  conversationHistory: ConversationHistoryItem[];
}

function isValidUnderstanding(
  value: unknown
): value is ConversationUnderstanding {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<ConversationUnderstanding>;
  return (
    typeof result.isFinanceRelated === "boolean" &&
    typeof result.intent === "string" &&
    typeof result.reference === "string"
  );
}

function parseOutput(value: string) {
  const cleaned = value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    const parsed: unknown = JSON.parse(cleaned);
    return isValidUnderstanding(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function understandConversation(
  input: UnderstandConversationInput
): Promise<ConversationUnderstanding | null> {
  if (
    process.env.AI_ENABLED !== "true" ||
    !process.env.OPENAI_API_KEY
  ) {
    return null;
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create(
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        instructions: `
You classify the current message for Wealth Growth, a personal finance assistant.
Use the current question, recent conversation, and financial context together.
Return JSON only with these fields:
{
  "isFinanceRelated": boolean,
  "intent": "affordability" | "spending_analysis" | "savings_analysis" | "budget_analysis" | "goal_planning" | "investment_analysis" | "cash_flow_analysis" | "general_financial_question" | "unsupported",
  "confidence": "high" | "medium" | "low",
  "reference": "purchase" | "goal" | "expense" | "investment" | "none",
  "purchaseItem": string | null,
  "purchasePrice": number | null,
  "goalName": string | null,
  "goalAmount": number | null,
  "goalMonths": number | null,
  "expenseCategory": string | null,
  "needsClarification": boolean
}

Rules:
- Understand follow-ups from conversation context. Resolve pronouns such as it and that.
- A short amount or timeline is an answer to the previous assistant request when context supports it.
- An explicit new purchase is a purchase, even if an older goal exists. Never attach its price to the old goal.
- A bare amount may attach to the active goal when the previous assistant asked for a target or cost.
- A timeline may attach to the most relevant active goal or purchase.
- Normal-life goals are finance-related when the purpose is budgeting, affordability, saving, or planning.
- Unrelated requests such as poems, sports results, general science, coding, or entertainment are unsupported.
- Do not invent values. Use null when a value is not present or cannot be resolved.
- Preserve exact numeric meaning. For example, "7 lakh 50 thousand" is 750000 and "after 4 months" is goalMonths 4.
`,
        input: JSON.stringify({
          currentQuestion: input.question,
          recentConversation: input.conversationHistory,
          financialContext: input.financialContext,
        }),
      },
      { timeout: 15_000, maxRetries: 0 }
    );

    return parseOutput(response.output_text || "");
  } catch (error) {
    console.error("Conversation understanding failed:", error);
    return null;
  }
}
