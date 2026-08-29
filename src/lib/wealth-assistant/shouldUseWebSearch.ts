export function shouldUseWebSearch(
  question: string
): boolean {
  const normalized = question
    .toLowerCase()
    .trim();

  const personalFinancePatterns = [
    "how much did i spend",
    "where am i spending",
    "my spending",
    "my expenses",
    "my income",
    "my savings",
    "my budget",
    "my goals",
    "my investments",
    "my portfolio",
    "my transactions",
    "am i saving",
    "can i afford",
    "should i buy",
    "how much should i save",
    "how long will it take me to save",
    "give me a goal plan",
    "make me a savings plan",
    "financial health",
    "review my finances",
    "my financial situation",
  ];

  const asksAboutPersonalData =
    personalFinancePatterns.some(
      (phrase) => normalized.includes(phrase)
    );

  const externalInformationPatterns = [
    "latest",
    "current",
    "today",
    "now",
    "recent",
    "news",
    "updated",
    "real time",
    "real-time",

    "ticket",
    "tickets",
    "ticket fare",
    "ticket price",
    "ticket cost",
    "ticket booking",

    "flight",
    "flight fare",
    "flight price",
    "flight cost",
    "airfare",

    "train fare",
    "train price",
    "train ticket",

    "bus fare",
    "bus price",
    "bus ticket",

    "hotel price",
    "hotel cost",
    "travel cost",
    "travel price",
    "visa fee",
    "weather",
    "forecast",

    "product price",
    "current price",
    "latest price",
    "market price",
    "compare prices",
    "cheapest",
    "best price",

    "stock price",
    "share price",
    "stock quote",
    "crypto price",
    "bitcoin price",
    "gold price",
    "gold rate",
    "mutual fund nav",
    "current nav",

    "interest rate",
    "loan rate",
    "fd rate",
    "tax rate",
    "tax rule",
    "inflation",
    "exchange rate",
    "currency rate",
  ];

  const asksForExternalInformation =
    externalInformationPatterns.some(
      (phrase) => normalized.includes(phrase)
    );

  if (
    asksAboutPersonalData &&
    !asksForExternalInformation
  ) {
    return false;
  }

  return asksForExternalInformation;
}