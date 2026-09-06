import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const styles = [
  "Can you tell me",
  "I want to know",
  "Please help me understand",
  "Could you show me",
  "What is",
  "How can I check",
  "I am trying to find out",
  "Help me calculate",
  "I would like to understand",
  "Can you explain",
];

const purchaseStyles = [
  "I am planning this purchase:",
  "For my purchase plan,",
  "Please help me with this purchase:",
  "I need guidance on this goal:",
  "My question is:",
  "I am considering this purchase:",
  "I want to plan for this:",
  "Could you work this out:",
  "I am budgeting for this:",
  "I need a savings estimate for this:",
];

const groups = [
  {
    prefix: "income",
    intent: "income_analysis",
    category: "income",
    subcategory: "income_trends",
    expectedFacts: ["period"],
    calculationType: "module_summary",
    dataSources: ["income", "transactions"],
    subjects: [
      "monthly income", "yearly income", "income trend", "income change", "income average",
      "income comparison", "highest income month", "lowest income month", "income stability", "income growth",
    ],
    templates: [
      "is {subject}", "changed recently in {subject}", "for the last few months", "compared with the previous period",
      "showing an increase or decrease", "telling me about my financial progress", "important for my budget",
      "enough for my current spending", "consistent across recent months", "likely to affect my savings",
    ],
  },
  {
    prefix: "expense",
    intent: "expense_analysis",
    category: "expenses",
    subcategory: "expense_trends",
    expectedFacts: ["expenseCategory", "period"],
    calculationType: "module_summary",
    dataSources: ["transactions", "analysis"],
    subjects: [
      "monthly expenses", "food spending", "travel spending", "shopping expenses", "the highest spending category",
      "unusual expenses", "expense trend", "essential expenses", "recurring expenses", "expense comparison",
    ],
    templates: [
      "where am I spending the most on {subject}", "what changed in {subject}", "how much did I spend on {subject}",
      "is {subject} higher than usual", "can I reduce {subject}", "show me a breakdown of {subject}",
      "what should I know about {subject}", "how does {subject} compare with my income", "which part of {subject} needs attention",
      "what is the trend for {subject}",
    ],
  },
  {
    prefix: "budget",
    intent: "budget_analysis",
    category: "budgets",
    subcategory: "budget_tracking",
    expectedFacts: ["expenseCategory", "period"],
    calculationType: "module_summary",
    dataSources: ["budgets", "transactions"],
    subjects: [
      "my monthly budget", "the food budget", "the travel budget", "budget remaining", "budget usage",
      "an exceeded budget", "category limits", "budget recommendations", "spending against budget", "next month's budget",
    ],
    templates: [
      "how much is left in {subject}", "have I exceeded {subject}", "am I on track with {subject}",
      "what should I change in {subject}", "compare spending with {subject}", "which category needs a limit in {subject}",
      "why did {subject} change", "help me review {subject}", "what is the safest way to manage {subject}",
      "can I afford my current plan for {subject}",
    ],
  },
  {
    prefix: "saving",
    intent: "saving_recommendation",
    category: "savings",
    subcategory: "saving_plans",
    expectedFacts: ["targetAmount", "timelineMonths"],
    calculationType: "monthly_saving",
    dataSources: ["income", "expenses", "analysis"],
    subjects: [
      "monthly saving", "savings rate", "future savings", "emergency savings", "saving capacity",
      "a regular saving plan", "saving more each month", "cash-flow surplus", "a savings target", "my saving progress",
    ],
    templates: [
      "how much should I set aside for {subject}", "how can I improve {subject}", "is {subject} healthy",
      "what monthly amount fits {subject}", "how long will {subject} take", "can my income support {subject}",
      "what is slowing down {subject}", "how should I prioritize {subject}", "give me a practical plan for {subject}",
      "what happens if I increase {subject}",
    ],
  },
  {
    prefix: "goal",
    intent: "goal_progress",
    category: "goals",
    subcategory: "goal_planning",
    expectedFacts: ["goalName", "targetAmount", "timelineMonths"],
    calculationType: "goal_progress",
    dataSources: ["goals", "income", "expenses"],
    subjects: [
      "my savings goal", "my travel goal", "my education goal", "my emergency-fund goal", "my home goal",
      "goal progress", "remaining goal amount", "goal completion date", "goal priority", "multiple financial goals",
    ],
    templates: [
      "how close am I to {subject}", "how much remains for {subject}", "what should I contribute to {subject}",
      "when will I complete {subject}", "can I prioritize {subject}", "is {subject} realistic",
      "help me plan {subject}", "what would improve {subject}", "compare my progress across {subject}",
      "what is the monthly requirement for {subject}",
    ],
  },
  {
    prefix: "purchase",
    intent: "purchase_planning",
    category: "goals",
    subcategory: "purchase",
    expectedFacts: ["purchaseItem", "targetAmount", "timelineMonths"],
    calculationType: "monthly_saving",
    dataSources: [],
    subjects: [
      "a bike", "a car", "a phone", "a laptop", "a house", "education", "a wedding", "a holiday", "gold jewelry", "another large purchase",
    ],
    templates: [
      "I want to buy {subject}; how much should I save each month",
      "what monthly saving do I need for {subject}",
      "I need to arrange money for {subject} by a future date",
      "how can I plan my savings for {subject}",
      "can I save enough for {subject} within my timeline",
      "what should I put aside every month for {subject}",
      "I want to purchase {subject} without disturbing my budget",
      "how long would it take me to afford {subject}",
      "help me create a target for {subject}",
      "what is a realistic plan for {subject}",
    ],
  },
  {
    prefix: "investment",
    intent: "investment_analysis",
    category: "investments",
    subcategory: "portfolio_review",
    expectedFacts: ["investmentType", "period"],
    calculationType: "module_summary",
    dataSources: ["investments", "investmentTransactions", "marketData"],
    subjects: [
      "my stock investments", "my mutual funds", "my gold investment", "my fixed deposits", "my portfolio value",
      "investment profit or loss", "investment returns", "asset allocation", "investment contributions", "investment goal",
    ],
    templates: [
      "what is happening with {subject}", "how has {subject} changed", "is {subject} diversified",
      "what is the current value of {subject}", "show me the performance of {subject}", "should I review {subject}",
      "how does {subject} affect my wealth", "what risks are visible in {subject}", "compare my holdings in {subject}",
      "what should I know before changing {subject}",
    ],
  },
  {
    prefix: "networth",
    intent: "net_worth",
    category: "net_worth",
    subcategory: "wealth_tracking",
    expectedFacts: ["period"],
    calculationType: "module_summary",
    dataSources: ["investments", "transactions", "goals"],
    subjects: [
      "my current net worth", "net-worth growth", "my assets", "my liabilities", "wealth changes",
      "net worth this month", "net worth over time", "assets versus liabilities", "my financial position", "wealth progress",
    ],
    templates: [
      "what is {subject}", "how has {subject} changed", "why did {subject} move", "show me a summary of {subject}",
      "what is driving {subject}", "compare {subject} with the previous period", "how can I improve {subject}",
      "which records affect {subject}", "is {subject} moving in the right direction", "help me understand {subject}",
    ],
  },
  {
    prefix: "health",
    intent: "financial_health",
    category: "financial_health",
    subcategory: "health_review",
    expectedFacts: ["period"],
    calculationType: "financial_health_summary",
    dataSources: ["analysis", "income", "expenses", "budgets", "investments"],
    subjects: [
      "my financial health score", "my savings ratio", "my expense ratio", "my financial weaknesses", "my money habits",
      "my emergency readiness", "my spending risk", "my budget discipline", "my financial strengths", "my overall money health",
    ],
    templates: [
      "how is {subject}", "what is affecting {subject}", "what are the risks in {subject}", "how can I improve {subject}",
      "what should I fix first in {subject}", "give me a review of {subject}", "is {subject} improving",
      "what does {subject} tell me", "which actions would strengthen {subject}", "explain {subject} in simple terms",
    ],
  },
  {
    prefix: "cashflow",
    intent: "cash_flow_analysis",
    category: "savings",
    subcategory: "cash_flow",
    expectedFacts: ["period"],
    calculationType: "cash_flow_summary",
    dataSources: ["income", "expenses", "transactions"],
    subjects: [
      "my monthly cash flow", "cash left after expenses", "my monthly surplus", "income versus expenses", "cash-flow trend",
      "my available surplus", "positive cash flow", "negative cash flow", "cash-flow pressure", "my spending capacity",
    ],
    templates: [
      "what is {subject}", "why did {subject} change", "is {subject} healthy", "how can I improve {subject}",
      "show me the main drivers of {subject}", "how does {subject} affect saving", "compare {subject} with last month",
      "what should I do about {subject}", "can I plan a purchase using {subject}", "explain {subject} without confusing it with account balance",
    ],
  },
  {
    prefix: "affordability",
    intent: "affordability",
    category: "goals",
    subcategory: "purchase_affordability",
    expectedFacts: ["targetAmount"],
    calculationType: "affordability_check",
    dataSources: ["income", "expenses", "currentSavings", "investments"],
    subjects: [
      "buying a car", "buying a bike", "buying a phone", "buying a laptop", "buying a house",
      "paying for education", "funding a wedding", "booking a holiday", "making a large purchase", "taking on a new expense",
    ],
    templates: [
      "can I afford {subject}", "is {subject} safe for my finances", "what would {subject} do to my cash flow",
      "should I wait before {subject}", "how much cash would I need for {subject}", "what risks should I consider before {subject}",
      "can my income support {subject}", "would {subject} affect my emergency buffer", "help me evaluate {subject}",
      "what information is needed to assess {subject}",
    ],
  },
  {
    prefix: "notification",
    intent: "notification_management",
    category: "notifications",
    subcategory: "alerts_and_reminders",
    expectedFacts: ["notificationType"],
    calculationType: "notification_preferences",
    dataSources: ["notifications", "notificationPreferences"],
    subjects: [
      "budget alerts", "goal reminders", "investment reminders", "bill reminders", "financial health alerts",
      "monthly summaries", "overspending notifications", "maturity reminders", "weekly insights", "notification preferences",
    ],
    templates: [
      "how do I manage {subject}", "can I turn {subject} on or off", "why did I receive {subject}",
      "which {subject} are enabled", "help me customize {subject}", "when should I receive {subject}",
      "how often will {subject} appear", "show me my settings for {subject}", "can I stop {subject}",
      "what does {subject} mean",
    ],
  },
];

const records = [];
let sequence = 1;

for (const group of groups) {
  for (let templateIndex = 0; templateIndex < group.templates.length; templateIndex += 1) {
    for (let styleIndex = 0; styleIndex < styles.length; styleIndex += 1) {
      const subject = group.subjects[templateIndex];
      let question = group.templates[templateIndex].replace("{subject}", subject);
      question = `${group.prefix === "purchase" ? purchaseStyles[styleIndex] : styles[styleIndex]} ${question}`;

      records.push({
        id: `${group.prefix}_${String(sequence).padStart(6, "0")}`,
        question,
        intent: group.intent,
        category: group.category,
        subcategory: group.subcategory,
        expectedFacts: group.expectedFacts,
        calculationType: group.calculationType,
        scenarioId: group.prefix === "purchase" ? "purchase_monthly_saving" : group.intent,
        dataSources: group.dataSources,
      });
      sequence += 1;
    }
  }
}

const outputPath = resolve("src/lib/wealth-assistant/questionDataset.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
console.log(`Generated ${records.length} question records at ${outputPath}`);