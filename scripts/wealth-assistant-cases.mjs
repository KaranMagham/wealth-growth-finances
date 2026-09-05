import assert from "node:assert/strict";
import { extractAmount } from "../src/lib/wealth-assistant/detectIntent.ts";
import { getConversationFacts, isFinanceRelated, resolveConversationState } from "../src/lib/wealth-assistant/conversationContext.ts";
import { calculateAffordability } from "../src/lib/wealth-assistant/calculateAffordability.ts";
import { getConversationTitle } from "../src/lib/wealth-assistant/conversationTitle.ts";

assert.equal(extractAmount("7 lakh 50 thousand"), 750000);
assert.equal(extractAmount("7.5 lakh"), 750000);
assert.equal(extractAmount("₹50,000"), 50000);

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