import {
  NextRequest,
  NextResponse,
} from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import {
  type DetectedIntent,
} from "@/lib/wealth-assistant/detectIntent";
import {
  getConversationFacts,
  isFinanceRelated,
  resolveConversationIntent,
  type ConversationHistoryItem,
  type ConversationFacts,
} from "@/lib/wealth-assistant/conversationContext";
import { calculateAffordability } from "@/lib/wealth-assistant/calculateAffordability";
import { getWealthAssistantContext } from "@/lib/wealth-assistant/getWealthAssistantContext";
import { getConversationTitle } from "@/lib/wealth-assistant/conversationTitle";
import { generateAiSuggestion } from "@/lib/wealth-assistant/generateAiSuggestion";
import { shouldUseWebSearch } from "@/lib/wealth-assistant/shouldUseWebSearch";
import { understandConversation } from "@/lib/wealth-assistant/understandConversation";
import WealthAssistantConversation, {
  type WealthAssistantConversationDocument,
} from "@/models/WealthAssistantConversation";
import WealthAssistantMessage from "@/models/WealthAssistantMessage";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

interface AskRequest {
  question?: string;
  conversationId?: string;
}

const HISTORY_LIMIT = 20;

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function getWebSearchFlag(question: string) {
  return (
    process.env.AI_ENABLE_WEB_SEARCH === "true" &&
    shouldUseWebSearch(question)
  );
}

function buildLocalAnswer(
  question: string,
  analysis: Awaited<ReturnType<typeof getWealthAssistantContext>>["analysis"],
  expenseCategory?: string
) {
  const normalized = question.toLowerCase();

  const lines: string[] = [];

  const topCategory =
    analysis.expenseBreakdown[0];

  const asksSpending =
    normalized.includes("spend") ||
    normalized.includes("expense");

  const asksSavings =
    normalized.includes("save") ||
    normalized.includes("saving");

  const asksIncome =
    normalized.includes("income") ||
    normalized.includes("earn");

  const asksInvestment =
    normalized.includes("investment") ||
    normalized.includes("portfolio");

  const asksGoal =
    normalized.includes("goal") ||
    normalized.includes("target");

  const asksBudget =
    normalized.includes("budget");

  const asksAdvice =
    normalized.includes("what should i do") ||
    normalized.includes("how can i reduce") ||
    normalized.includes("reduce my") ||
    normalized.includes("advice") ||
    normalized.includes("recommend");

  if (asksSpending) {
    const category = expenseCategory
      ? analysis.expenseBreakdown.find((item) => item.category.toLowerCase() === expenseCategory.toLowerCase())
      : undefined;
    if (category) {
      lines.push(`You spent ${formatCurrency(category.amount)} on ${category.category} during ${analysis.period.label.toLowerCase()}.`);
    }
    if (!topCategory) {
      lines.push(
        "You have no recorded expenses for this period."
      );
    } else {
      lines.push(
        `You spent ${formatCurrency(
          analysis.summary.expenses
        )} this month.`
      );

      lines.push(
        `Your largest spending category is ${
          topCategory.category
        } at ${formatCurrency(
          topCategory.amount
        )}.`
      );
    }
  }

  if (asksSavings) {
    lines.push(
      `You saved approximately ${formatCurrency(
        analysis.summary.savings
      )} this month, giving you a savings rate of ${Math.round(
        analysis.summary.savingsRate
      )}%.`
    );
  }

  if (asksIncome) {
    lines.push(
      `Your recorded income this month is ${formatCurrency(
        analysis.summary.income
      )}.`
    );
  }

  if (asksInvestment) {
    lines.push(
      `Your current recorded investment value is ${formatCurrency(
        analysis.summary.investmentValue
      )}, with a recorded profit or loss of ${formatCurrency(
        analysis.summary.investmentProfitLoss
      )}.`
    );
  }

  if (asksGoal) {
    lines.push(
      `You have ${
        analysis.goals.totalGoals
      } goal(s), with overall progress of ${Math.round(
        analysis.goals.overallProgress
      )}%.`
    );
  }

  if (asksBudget) {
    lines.push(
      `You have used ${formatCurrency(
        analysis.summary.budgetUsed
      )} of your ${formatCurrency(
        analysis.summary.budgetedAmount
      )} budget.`
    );
  }

  if (asksAdvice && topCategory) {
    lines.push(
      `To reduce expenses, review your ${
        topCategory.category
      } spending first because it is your largest recorded category.`
    );

    lines.push(
      "You can also review recurring expenses and compare each category with your budget."
    );
  }

  if (lines.length === 0) {
    lines.push(
      "I can answer questions about your income, expenses, savings, budgets, goals, and investments."
    );
  }

  return lines.join("\n\n");
}

function buildContextualLocalAnswer(
  question: string,
  analysis: Awaited<ReturnType<typeof getWealthAssistantContext>>["analysis"],
  facts: ReturnType<typeof getConversationFacts>,
  intent: string
) {
  const normalized = question.toLowerCase();

  if (
    facts.purchasePrice &&
    (intent === "affordability" ||
      /buy|purchase/.test(normalized)) &&
    /buy|purchase|keep|left|after buying|afford|next month|after\s+\d+\s*months?/.test(normalized)
  ) {
    const remainingCash =
      Math.max(0, analysis.summary.savings) - facts.purchasePrice;

    if (remainingCash < 0) {
      return `The ${facts.itemName || "purchase"} costs ${formatCurrency(
        facts.purchasePrice
      )}, which is ${formatCurrency(
        Math.abs(remainingCash)
      )} more than your available cash. You would not be able to pay for it entirely from your current available cash.`;
    }

    return `After buying the ${facts.itemName || "purchase"}, you would have approximately ${formatCurrency(
      remainingCash
    )} left in available cash. Keep at least three months of essential expenses as an emergency buffer before proceeding.`;
  }

  if (
    facts.goalName &&
    facts.goalAmount &&
    facts.goalMonths
  ) {
    return `For your ${facts.goalName}, the target is ${formatCurrency(
      facts.goalAmount
    )}. Over ${facts.goalMonths} months, save about ${formatCurrency(
      facts.goalAmount / facts.goalMonths
    )} per month.`;
  }

  if (
    facts.goalName &&
    !/\b(?:buy|purchase)\b/.test(normalized) &&
    /save|saving|how much|plan|travel|trip/.test(normalized)
  ) {
    if (!facts.goalAmount) {
      return `I can help plan your ${facts.goalName}. What is the estimated total cost and when do you want to go?`;
    }

    const monthlyTarget = facts.goalMonths
      ? facts.goalAmount / facts.goalMonths
      : facts.goalAmount;
    return `For your ${facts.goalName}, the target is ${formatCurrency(
      facts.goalAmount
    )}.${facts.goalMonths ? ` Over ${facts.goalMonths} months, save about ${formatCurrency(monthlyTarget)} per month.` : " Tell me your timeline and I can calculate the monthly saving target."}`;
  }

  if (
    facts.goalName &&
    facts.goalAmount &&
    !/\b(?:buy|purchase)\b/.test(normalized)
  ) {
    return `I recorded a target of ${formatCurrency(
      facts.goalAmount
    )} for your ${facts.goalName}. Tell me when you want to go and I can calculate the monthly saving target.`;
  }

  if (
    facts.expenseCategory &&
    /too much|that|it/.test(normalized)
  ) {
    const category = analysis.expenseBreakdown.find(
      (item) =>
        item.category.toLowerCase() ===
        facts.expenseCategory?.toLowerCase()
    );
    const budget = analysis.budgetBreakdown.find(
      (item) =>
        item.category.toLowerCase() ===
        facts.expenseCategory?.toLowerCase()
    );

    if (!category) {
      return `I do not have recorded spending data for ${facts.expenseCategory}.`;
    }

    return `${facts.expenseCategory} spending is ${formatCurrency(
      category.amount
    )} this month, or ${category.percentage.toFixed(1)}% of your recorded expenses.${budget ? ` The recorded budget is ${formatCurrency(budget.limit)}.` : " There is no recorded budget for comparison."}`;
  }

  if (facts.goalName && /himalaya|travel|trip|vacation/.test(normalized)) {
    return `I can help plan your ${facts.goalName}. What is the estimated total cost and target month?`;
  }

  return buildLocalAnswer(question, analysis, facts.expenseCategory);
}

function buildResolvedCalculationAnswer(
  question: string,
  facts: ConversationFacts,
  hasRealBalance: boolean,
  previousAssistant: string
) {
  const targetAmount = facts.targetAmount ?? facts.purchasePrice;
  const monthlySaving = facts.monthlySaving;
  const timelineMonths = facts.timelineMonths;
  const asksHowLong = /how many months|how long|take to|months will/i.test(question);
  const asksMonthly = /how much should i save|save monthly|per month|monthly saving/i.test(question) ||
    (/when|how many months|timeline/i.test(previousAssistant) && Boolean(timelineMonths));
  const isPurchase = Boolean(facts.purchaseItem || facts.purchasePrice);

  if (isPurchase && facts.purchasePrice && monthlySaving && !hasRealBalance && /afford|buy|purchase|gift|house|car|bike/i.test(question)) {
    const months = Math.ceil(facts.purchasePrice / monthlySaving);
    return `I do not have a recorded account balance, so I cannot confirm whether you can pay ${formatCurrency(facts.purchasePrice)} today. At your stated saving capacity of ${formatCurrency(monthlySaving)} per month, saving the full amount from ₹0 would take approximately ${months} months.`;
  }

  if (targetAmount && monthlySaving && (asksHowLong || facts.questionType === "time_to_target" || (!asksMonthly && !timelineMonths))) {
    const months = Math.ceil(targetAmount / monthlySaving);
    const years = (months / 12).toFixed(1);
    return `At ${formatCurrency(monthlySaving)} saved each month, reaching ${formatCurrency(targetAmount)} would take approximately ${months} months (${years} years). Assumptions: starting from ₹0 toward the target, no investment returns, no house-price increases, and no other contributions.`;
  }

  if (targetAmount && timelineMonths && (asksMonthly || facts.questionType === "required_monthly_saving" || isPurchase)) {
    return `To reach ${formatCurrency(targetAmount)} in ${timelineMonths} months, you need to save approximately ${formatCurrency(targetAmount / timelineMonths)} per month.`;
  }

  if (targetAmount && /how much should i save|monthly|per month/i.test(question) && !timelineMonths) {
    return `Your target is ${formatCurrency(targetAmount)}. When do you want to reach it? Tell me the timeline and I will calculate the required monthly saving.`;
  }

  if (isPurchase && facts.purchasePrice && !hasRealBalance && /afford|can i buy|buy/i.test(question)) {
    return `I do not have a recorded account balance, so I cannot confirm whether you can pay ${formatCurrency(facts.purchasePrice)} today. Tell me how much you currently have available or how much you can save each month, and I can estimate the timeline.`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    let body: AskRequest;

    try {
      body = (await request.json()) as AskRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: "Question is required.",
        },
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Question must be 500 characters or fewer.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    let conversation: mongoose.HydratedDocument<
      WealthAssistantConversationDocument
    > | null;
    if (body.conversationId) {
      if (!mongoose.isValidObjectId(body.conversationId)) {
        return NextResponse.json(
          { success: false, message: "Invalid conversation." },
          { status: 400 }
        );
      }

      conversation = await WealthAssistantConversation.findOne({
        _id: body.conversationId,
        userId,
      });

      if (!conversation) {
        return NextResponse.json(
          { success: false, message: "Conversation not found." },
          { status: 404 }
        );
      }
    } else {
      conversation = await WealthAssistantConversation.create({
        userId,
        title: question.slice(0, 80),
        status: "active",
        saveStatus: "temporary",
      });
    }

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: "Unable to create conversation." },
        { status: 500 }
      );
    }

    const activeConversation = conversation;

    const previousMessages = await WealthAssistantMessage.find({
      conversationId: conversation._id,
      userId,
    })
      .sort({ createdAt: -1 })
      .limit(HISTORY_LIMIT)
      .lean();

    const conversationHistory = previousMessages.reverse().map((message) => ({
      role: message.role,
      content: message.content,
    }));

    await WealthAssistantMessage.create({
      conversationId: conversation._id,
      userId,
      role: "user",
      content: question,
    });

    if (conversation.title === "New Conversation") {
      conversation.title = getConversationTitle(question);
      await conversation.save();
    }

    await WealthAssistantConversation.updateOne(
      { _id: conversation._id, userId },
      { $set: { updatedAt: new Date() } }
    );

    const typedHistory = conversationHistory as ConversationHistoryItem[];

    const { context, analysis } = await getWealthAssistantContext(
      userId,
      question
    );

    const understanding = await understandConversation({
      question,
      financialContext: context,
      conversationHistory: typedHistory,
    });

    const deterministicFacts = getConversationFacts(typedHistory, question);
    const facts: ConversationFacts = {
      ...deterministicFacts,
      itemName: deterministicFacts.itemName ?? understanding?.purchaseItem,
      purchasePrice: deterministicFacts.purchasePrice ?? understanding?.purchasePrice,
      goalName: deterministicFacts.goalName ?? understanding?.goalName,
      goalAmount: deterministicFacts.goalAmount ?? understanding?.goalAmount,
      goalMonths: deterministicFacts.goalMonths ?? understanding?.goalMonths,
      expenseCategory: deterministicFacts.expenseCategory ?? understanding?.expenseCategory,
    };

    const deterministicIntent = resolveConversationIntent(
      question,
      typedHistory,
      facts
    );
    const detected: DetectedIntent = deterministicIntent.intent !== "general_financial_question"
      ? deterministicIntent
      : understanding
        ? {
            intent: understanding.intent === "goal_planning" ? "financial_planning" : understanding.intent,
            confidence: understanding.confidence,
            purchasePrice: facts.purchasePrice,
            itemName: facts.itemName,
          }
        : deterministicIntent;

    const financeRelated =
      isFinanceRelated(question, typedHistory) ||
      Boolean(facts.isContextualFollowUp) ||
      understanding?.isFinanceRelated === true;

    if (!financeRelated) {
      const answer =
        "I’m your Wealth Growth financial assistant, so I can help with budgeting, saving, investments, expenses, goals, and other personal-finance questions.";
      await WealthAssistantMessage.create({
        conversationId: activeConversation._id,
        userId,
        role: "assistant",
        content: answer,
      });
      return NextResponse.json({
        success: true,
        intent: "unsupported",
        confidence: understanding?.confidence || "high",
        answer,
        conversationId: String(conversation._id),
        period: analysis.period,
        aiGenerated: false,
        webSearchUsed: false,
      });
    }

    async function saveAssistantAnswer(answer: string) {
      await WealthAssistantMessage.create({
        conversationId: activeConversation._id,
        userId,
        role: "assistant",
        content: answer,
      });

      await WealthAssistantConversation.updateOne(
        { _id: activeConversation._id, userId },
        { $set: { updatedAt: new Date() } }
      );
    }

    const resolvedAnswer = buildResolvedCalculationAnswer(
      question,
      facts,
      context.summary.accountBalance !== null,
      [...typedHistory].reverse().find((item) => item.role === "assistant")?.content || ""
    );

    if (resolvedAnswer) {
      await saveAssistantAnswer(resolvedAnswer);
      return NextResponse.json({
        success: true,
        intent: detected.intent,
        confidence: detected.confidence,
        answer: resolvedAnswer,
        conversationId: String(conversation._id),
        period: analysis.period,
        aiGenerated: false,
        webSearchUsed: false,
      });
    }

    if (
      (detected.intent === "financial_planning" ||
        detected.intent === "savings_analysis") &&
      facts.goalName &&
      facts.goalAmount &&
      facts.goalMonths &&
      facts.goalMonths > 0
    ) {
      const monthlyTarget = facts.goalAmount / facts.goalMonths;
      const answer = `For your ${facts.goalName}, the target is ${formatCurrency(
        facts.goalAmount
      )}. Over ${facts.goalMonths} months, save about ${formatCurrency(
        monthlyTarget
      )} per month.`;
      await saveAssistantAnswer(answer);

      return NextResponse.json({
        success: true,
        intent: detected.intent,
        confidence: detected.confidence,
        answer,
        conversationId: String(conversation._id),
        period: analysis.period,
        aiGenerated: false,
        webSearchUsed: false,
      });
    }

    const webSearchUsed =
      getWebSearchFlag(question);

    const aiAnswer =
      await generateAiSuggestion({
        question,
        financialContext: context,
        conversationHistory,
        conversationFacts: facts,
        useWebSearch: webSearchUsed,
      });

    if (aiAnswer) {
      await saveAssistantAnswer(aiAnswer);
      return NextResponse.json({
        success: true,
        intent: detected.intent,
        confidence: detected.confidence,
        answer: aiAnswer,
        conversationId: String(conversation._id),
        period: analysis.period,
        aiGenerated: true,
        webSearchUsed,
      });
    }

    if (detected.intent === "affordability") {
      if (
        !detected.purchasePrice ||
        detected.purchasePrice <= 0
      ) {
        const answer =
          "Please include the purchase price, such as ₹2 lakh or ₹2,00,000.";
        await saveAssistantAnswer(answer);
        return NextResponse.json({
          success: true,
          intent: detected.intent,
          confidence: detected.confidence,
          answer,
          conversationId: String(conversation._id),
          period: analysis.period,
          aiGenerated: false,
          webSearchUsed,
        });
      }

      const result =
        calculateAffordability({
          ...context.affordability,
          purchasePrice:
            detected.purchasePrice,
        });

      const answer = `Based on your recorded financial data:

    ${result.reasons.join("\n")}

    This is an informational estimate, not guaranteed financial advice.`;
      await saveAssistantAnswer(answer);

      return NextResponse.json({
        success: true,
        intent: detected.intent,
        confidence: detected.confidence,
        answer,
        calculation: result,
        conversationId: String(conversation._id),
        period: analysis.period,
        aiGenerated: false,
        webSearchUsed,
      });
    }

    const answer = buildContextualLocalAnswer(
      question,
      analysis,
      facts,
      detected.intent
    );
    await saveAssistantAnswer(answer);

    return NextResponse.json({
      success: true,
      intent: detected.intent,
      confidence: detected.confidence,
      answer,
      conversationId: String(conversation._id),
      period: analysis.period,
      aiGenerated: false,
      webSearchUsed: false,
    });
  } catch (error) {
    console.error(
      "Wealth assistant ask error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process your financial question.",
      },
      { status: 500 }
    );
  }
}