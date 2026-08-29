import OpenAI from "openai";

import type { FinancialContext } from "./buildFinancialContext";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AiSuggestionInput {
  question: string;
  financialContext: FinancialContext;
  useWebSearch?: boolean;
}

function isQuotaError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const value = error as {
    status?: number;
    code?: string;
    type?: string;
    error?: {
      code?: string;
      type?: string;
    };
  };

  return (
    value.status === 429 ||
    value.code === "insufficient_quota" ||
    value.type === "insufficient_quota" ||
    value.error?.code === "insufficient_quota" ||
    value.error?.type === "insufficient_quota"
  );
}

function isRateLimitError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const value = error as {
    status?: number;
    code?: string;
  };

  return (
    value.status === 429 ||
    value.code === "rate_limit_exceeded"
  );
}

export async function generateAiSuggestion(
  input: AiSuggestionInput
): Promise<string | null> {
  if (
    process.env.AI_ENABLED !== "true" ||
    !process.env.OPENAI_API_KEY
  ) {
    return null;
  }

  try {
    const tools = input.useWebSearch
      ? [
          {
            type: "web_search_preview" as const,
          },
        ]
      : undefined;

    const response = await client.responses.create(
      {
        model:
          process.env.OPENAI_MODEL ||
          "gpt-4o-mini",

        instructions: `
You are Wealth Assistant for a personal finance application.

Answer the user's question using the complete financial context provided.

Your responsibilities:
- Explain spending, savings, budgets, goals, investments, affordability, and cash flow.
- Combine multiple parts of the financial context when needed.
- Give practical and cautious recommendations.
- For goals, create realistic savings plans using the user's actual surplus.
- For affordability, consider cash, expenses, savings, goals, and emergency buffers.
- For scenario questions, clearly explain the assumptions and estimated effect.
- For financial-health questions, identify strengths, risks, and prioritized actions.

Rules:
- Treat recorded user data as the source of truth for personal calculations.
- Do not invent income, expenses, balances, goals, or investments.
- Do not create, edit, delete, or execute financial transactions.
- Do not promise investment returns or guaranteed outcomes.
- Distinguish recorded financial facts from external web information.
- Use web search only for current or external information.
- If web search is used, clearly mention that current web information was used.
- If important data is missing, say what is missing.
- Explain calculations in simple language.
- Keep answers useful and reasonably concise.
- End with a short informational-guidance disclaimer when giving recommendations.
`,

        input: JSON.stringify({
          userQuestion: input.question,
          financialContext: input.financialContext,
        }),

        ...(tools ? { tools } : {}),
      },
      {
        timeout: 15_000,
        maxRetries: 0,
      }
    );

    return response.output_text?.trim() || null;
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn(
        "AI suggestion unavailable: OpenAI quota is exhausted."
      );

      return null;
    }

    if (isRateLimitError(error)) {
      console.warn(
        "AI suggestion unavailable: request rate limit reached."
      );

      return null;
    }

    console.error(
      "AI suggestion request failed:",
      error
    );

    return null;
  }
}