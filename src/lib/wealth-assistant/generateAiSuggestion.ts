import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

import type { FinancialContext } from "./buildFinancialContext";

interface AiSuggestionInput {
  question: string;
  financialContext: FinancialContext;
  conversationFacts?: Record<string, string | number | boolean | undefined>;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  useWebSearch?: boolean;
}

const WEALTH_ASSISTANT_INSTRUCTIONS = `
You are Wealth Assistant for a personal finance application.

Answer the user's question using the complete financial context provided.

Your responsibilities:
- Explain spending, savings, budgets, goals, investments, affordability, and cash flow.
- Combine multiple parts of the financial context when needed.
- Give practical and cautious recommendations.
- For goals, create realistic savings plans using the user's actual surplus.
- For affordability, use accountBalance only when it is not null. Otherwise explain that monthlySurplus is an estimate and is not cash on hand.
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
- Treat summary.monthlySurplus and summary.accountBalance as different values. Never call monthlySurplus an account balance.
- Only answer personal-finance, budgeting, saving, investing, goals, expenses, income, affordability, or financial-planning questions. Politely refuse unrelated requests.
- Use the recent conversation history to resolve follow-up references such as "it", "that", or "next month".
- Treat explicit new purchases as separate from older goals. Use the resolved conversation facts when calculating purchase prices, goal targets, and timelines.
- Explain calculations in simple language.
- Keep answers useful and reasonably concise.
- End with a short informational-guidance disclaimer when giving recommendations.
`;

function buildAiInput(input: AiSuggestionInput) {
  return JSON.stringify({
    userQuestion: input.question,
    financialContext: input.financialContext,
    conversationHistory: input.conversationHistory ?? [],
    conversationFacts: input.conversationFacts ?? {},
  });
}

function getProviderFailureReason(error: unknown) {
  if (!error || typeof error !== "object") {
    return "request_error";
  }

  const value = error as {
    status?: number;
    code?: string;
    name?: string;
    message?: string;
  };
  const details = `${value.code ?? ""} ${value.name ?? ""} ${value.message ?? ""}`.toLowerCase();

  if (value.status === 429 || details.includes("quota") || details.includes("rate_limit")) {
    return "quota_or_rate_limit";
  }

  if (details.includes("timeout") || details.includes("timed out") || details.includes("abort")) {
    return "timeout";
  }

  if (value.status !== undefined && value.status >= 500) {
    return "provider_unavailable";
  }

  if (details.includes("unavailable") || details.includes("service_unavailable")) {
    return "provider_unavailable";
  }

  return "api_error";
}

function logProviderFailure(provider: "OpenAI" | "Gemini", error: unknown) {
  console.warn("Wealth assistant provider failed", {
    provider,
    reason: getProviderFailureReason(error),
  });
}

export async function generateAiSuggestion(
  input: AiSuggestionInput
): Promise<string | null> {
  if (process.env.AI_ENABLED !== "true") {
    return null;
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

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

          instructions: WEALTH_ASSISTANT_INSTRUCTIONS,

          input: buildAiInput(input),

          ...(tools ? { tools } : {}),
        },
        {
          timeout: 15_000,
          maxRetries: 0,
        }
      );

      const answer = response.output_text?.trim();
      if (answer) {
        return answer;
      }
    } catch (error) {
      logProviderFailure("OpenAI", error);
    }
  } else {
    console.warn("Wealth assistant provider unavailable", {
      provider: "OpenAI",
      reason: "not_configured",
    });
  }

  return generateGeminiSuggestion(input);
}

export async function generateGeminiSuggestion(
  input: AiSuggestionInput
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Wealth assistant provider unavailable", {
      provider: "Gemini",
      reason: "not_configured",
    });
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: buildAiInput(input),
      config: {
        systemInstruction: WEALTH_ASSISTANT_INSTRUCTIONS,
        abortSignal: controller.signal,
      },
    });

    return response.text?.trim() || null;
  } catch (error) {
    logProviderFailure("Gemini", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}