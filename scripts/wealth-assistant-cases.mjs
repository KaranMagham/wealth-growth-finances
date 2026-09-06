import assert from "node:assert/strict";
import { detectIntent, extractAmount } from "../src/lib/wealth-assistant/detectIntent.ts";
import { getConversationFacts, isFinanceRelated, resolveConversationIntent, resolveConversationState } from "../src/lib/wealth-assistant/conversationContext.ts";
import { calculateAffordability } from "../src/lib/wealth-assistant/calculateAffordability.ts";
import { getConversationTitle } from "../src/lib/wealth-assistant/conversationTitle.ts";
import {
  buildScenarioAnswer,
  matchQuestionScenario,
  QUESTION_LIBRARY,
} from "../src/lib/wealth-assistant/questionLibrary.ts";

assert.equal(extractAmount("7 lakh 50 thousand"), 750000);
assert.equal(extractAmount("7.5 lakh"), 750000);
assert.equal(extractAmount("₹50,000"), 50000);
assert.equal(extractAmount("70lakhs"), 7000000);
assert.equal(detectIntent("Can I afford a ₹2 lakh bike?").intent, "affordability");
assert.equal(detectIntent("How much should I save for a ₹2 lakh bike?").intent, "savings_analysis");
assert.equal(detectIntent("Can I afford a ₹7 lakh car?").intent, "affordability");
assert.equal(detectIntent("I want a ₹7 lakh car in 2 years, how much should I save?").intent, "savings_analysis");
assert.ok(QUESTION_LIBRARY.length >= 1000);
assert.equal(new Set(QUESTION_LIBRARY.map((record) => record.question)).size, QUESTION_LIBRARY.length);

const goalHistory = [
  { role: "user", content: "I want to go to Himalaya" },
  { role: "assistant", content: "What is your target amount?" },
];
const targetFacts = getConversationFacts(goalHistory, "₹50,000");
assert.equal(targetFacts.goalName, "Himalaya trip");
assert.equal(targetFacts.goalAmount, 50000);
const timelineFacts = getConversationFacts(
  [...goalHistory, { role: "user", content: "₹50,000" }, { role: "assistant", content: "How many months do you have?" }],
  "4 months"
);
assert.equal(timelineFacts.goalMonths, 4);

const bikeFacts = getConversationFacts(
  [{ role: "user", content: "Can I afford a bike?" }, { role: "assistant", content: "What is the purchase price?" }],
  "7.5 lakh"
);
assert.equal(bikeFacts.purchasePrice, 750000);
const affordabilityFacts = getConversationFacts([], "Can I afford a ₹2 lakh bike?");
assert.equal(affordabilityFacts.purchaseItem, "bike");
assert.equal(affordabilityFacts.targetAmount, 200000);
assert.equal(resolveConversationIntent("Can I afford a ₹2 lakh bike?", [], affordabilityFacts).intent, "affordability");
assert.equal(
  matchQuestionScenario("Can I afford a ₹2 lakh bike?", affordabilityFacts)?.scenarioId,
  "affordability"
);
const affordabilityFollowUp = getConversationFacts(
  [{ role: "user", content: "Can I afford a ₹2 lakh bike?" }],
  "in next 2 years"
);
assert.equal(affordabilityFollowUp.timelineMonths, 24);
assert.equal(
  resolveConversationIntent(
    "in next 2 years",
    [{ role: "user", content: "Can I afford a ₹2 lakh bike?" }],
    affordabilityFollowUp
  ).intent,
  "affordability"
);
assert.equal(getConversationFacts([], "I save ₹50,000 monthly").monthlySaving, 50000);

const houseState = resolveConversationState([], "I want to buy a 3cr house and save 2 lakh every month");
assert.equal(houseState.targetAmount, 30000000);
assert.equal(houseState.monthlySaving, 200000);
assert.equal(Math.ceil(houseState.targetAmount / houseState.monthlySaving), 150);

const carTimelineState = resolveConversationState(
  [{ role: "user", content: "I want to buy a ₹7 lakh car" }, { role: "assistant", content: "When do you want to buy it?" }],
  "in 7 months"
);
assert.equal(carTimelineState.purchasePrice, 700000);
assert.equal(carTimelineState.timelineMonths, 7);
assert.equal(Math.round(carTimelineState.targetAmount / carTimelineState.timelineMonths), 100000);

const carYearsState = resolveConversationState(
  [{ role: "user", content: "I want to buy a ₹7 lakh car" }, { role: "assistant", content: "When do you want to reach it?" }],
  "I want it in 2 years"
);
assert.equal(carYearsState.purchaseItem, "car");
assert.equal(carYearsState.purchasePrice, 700000);
assert.equal(carYearsState.timelineMonths, 24);
assert.equal(Math.round(carYearsState.targetAmount / carYearsState.timelineMonths), 29167);
const initialCarPlanningState = resolveConversationState(
  [],
  "I want to buy a ₹7 lakh car. How much should I save every month?"
);
const carPlanningFollowUp = resolveConversationState(
  [
    { role: "user", content: "I want to buy a ₹7 lakh car. How much should I save every month?" },
    { role: "assistant", content: "Your target is ₹7,00,000. When do you want to reach it?" },
  ],
  "in 2 years"
);
assert.equal(initialCarPlanningState.purchaseItem, "car");
assert.equal(initialCarPlanningState.targetAmount, 700000);
assert.equal(carPlanningFollowUp.targetAmount, 700000);
assert.equal(carPlanningFollowUp.timelineMonths, 24);
assert.equal(Math.round(carPlanningFollowUp.targetAmount / carPlanningFollowUp.timelineMonths), 29167);
assert.equal(
  resolveConversationState(
    [
      { role: "user", content: "I want to buy a bike in 2 years" },
      { role: "assistant", content: "What is the target price for the bike?" },
    ],
    "70lakh"
  ).targetAmount,
  7000000
);
assert.equal(resolveConversationState([], "in two years").timelineMonths, 24);
assert.equal(resolveConversationState([], "after 2 years").timelineMonths, 24);
assert.equal(resolveConversationState([], "next 24 months").timelineMonths, 24);
const variationStates = [
  resolveConversationState([], "I need ₹2 lakh for a bike after two years"),
  resolveConversationState([], "I want a bike costing 200000 and I have two years"),
  resolveConversationState([], "How much should I save monthly for a ₹2 lakh bike over 24 months?"),
];
for (const variationState of variationStates) {
  assert.equal(variationState.purchaseItem, "bike");
  assert.equal(variationState.targetAmount, 200000);
  assert.equal(variationState.timelineMonths, 24);
}

const newBikeWithoutPrice = resolveConversationState(
  [{ role: "user", content: "I want to buy a ₹7 lakh car" }],
  "I want to buy the bike in next 2 years"
);
assert.equal(newBikeWithoutPrice.purchaseItem, "bike");
assert.equal(newBikeWithoutPrice.purchasePrice, undefined);
assert.equal(newBikeWithoutPrice.targetAmount, undefined);
assert.equal(newBikeWithoutPrice.timelineMonths, 24);

const purchaseScenario = matchQuestionScenario(
  "I want to buy a ₹7 lakh car. How much should I save every month?",
  getConversationFacts([], "I want to buy a ₹7 lakh car. How much should I save every month?")
);
assert.equal(purchaseScenario?.scenarioId, "purchase_monthly_saving");
assert.equal(
  matchQuestionScenario(
    "I wanna get a 2 lakh bike in the next 2 years, how much do I need to save?",
    { topic: "purchase", targetAmount: 200000, timelineMonths: 24, purchaseItem: "bike" }
  )?.scenarioId,
  "purchase_monthly_saving"
);
assert.match(
  buildScenarioAnswer(purchaseScenario, {
    purchaseItem: "car",
    targetAmount: 700000,
    timelineMonths: 24,
  }),
  /₹29,167 per month/
);
assert.match(
  buildScenarioAnswer(
    purchaseScenario,
    { purchaseItem: "bike", timelineMonths: 24 }
  ),
  /target price for the bike/
);

const replacedCarState = resolveConversationState(
  [{ role: "user", content: "Can I afford a ₹2 lakh bike?" }],
  "I want to buy a 700000 car."
);
assert.equal(replacedCarState.purchaseItem, "car");
assert.equal(replacedCarState.purchasePrice, 700000);

const replacedHouseState = resolveConversationState(
  [{ role: "user", content: "I want a ₹7 lakh car." }],
  "Actually I want a ₹3 crore house."
);
assert.equal(replacedHouseState.purchaseItem, "house");
assert.equal(replacedHouseState.purchasePrice, 30000000);

const reallyState = resolveConversationState(
  [{ role: "user", content: "Can I afford a ₹5 lakh gift?" }, { role: "assistant", content: "I do not have a recorded account balance." }],
  "really?"
);
assert.equal(reallyState.isContextualFollowUp, true);
assert.equal(reallyState.purchasePrice, 500000);

const amountFollowUp = getConversationFacts(
  [{ role: "user", content: "I want to go to Himalaya" }, { role: "assistant", content: "What is your target amount?" }],
  "₹50,000"
);
assert.equal(amountFollowUp.targetAmount, 50000);
assert.equal(getConversationFacts(
  [{ role: "user", content: "I want to go to Himalaya" }, { role: "assistant", content: "How many months do you have?" }],
  "after 4 months"
).timelineMonths, 4);
assert.equal(isFinanceRelated("Write me a poem", []), false);
assert.equal(getConversationTitle("How much did I spend on food?"), "Food Spending");
assert.equal(calculateAffordability({
  purchasePrice: 750000,
  availableCash: null,
  averageMonthlyIncome: 100000,
  averageMonthlyExpenses: 60000,
  averageMonthlySavings: 40000,
  essentialMonthlyExpenses: 60000,
  upcomingGoalRequirement: 0,
  existingBudgetCommitments: 0,
  currentInvestments: 0,
}).cashAfterPurchase, null);

console.log("Wealth Assistant deterministic cases passed.");