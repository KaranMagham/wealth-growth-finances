export function getConversationTitle(question: string) {
  const normalized = question.toLowerCase();

  if (/\b(?:bike|car|phone|laptop)\b/.test(normalized) && /afford|buy|purchase|price|cost/.test(normalized)) {
    const item = normalized.match(/\b(bike|car|phone|laptop)\b/)?.[1];
    return `${item ? item[0].toUpperCase() + item.slice(1) : "Purchase"} Affordability`;
  }
  if (/himalaya|travel|trip|vacation|holiday/.test(normalized)) return normalized.includes("himalaya") ? "Himalaya Trip Planning" : "Travel Planning";
  if (/spend|spending|expense/.test(normalized)) {
    const category = normalized.match(/on\s+(.+)$/)?.[1]?.replace(/[?!.]+$/, "").trim();
    return category ? `${category[0].toUpperCase() + category.slice(1)} Spending` : "Spending Analysis";
  }
  if (/budget/.test(normalized)) return "Budget Planning";
  if (/invest|stock|mutual fund|portfolio|gold|crypto/.test(normalized)) return "Investment Planning";
  if (/save|saving|goal|money|income|financial|afford|cost|price/.test(normalized)) return "Financial Planning";
  return "New Conversation";
}