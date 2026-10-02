// Claude prices in USD per million tokens. Checked against
// https://platform.claude.com/docs/en/about-claude/pricing on 2026-10-03; re-check when models change.
// Cache write = the 5-minute cache (1.25x input); cache read = 0.1x input (0.05x on Opus 5.5).

export type ModelPrice = { input: number; output: number; cacheWrite: number; cacheRead: number };

const PRICES: Record<string, ModelPrice> = {
  "claude-sonnet-5-5": { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
  "claude-sonnet-5": { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
  "claude-haiku-4-5": { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
  "claude-opus-5-5": { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
};

export type TokenUsage = { inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number };

// The most expensive known price, used when a model is missing from the table so spend is never under-counted.
function mostExpensivePrice(): ModelPrice {
  return Object.values(PRICES).reduce((highest, price) => (price.output > highest.output ? price : highest));
}

// Cost of one call in USD. An unknown model logs a warning and is priced at the most expensive known model.
export function costInUsd(model: string, usage: TokenUsage): number {
  let price = PRICES[model];
  if (!price) {
    console.warn(`No price for model "${model}" in lib/ai/prices.ts; using the most expensive known price.`);
    price = mostExpensivePrice();
  }
  const perToken = (pricePerMillion: number, tokens: number) => (pricePerMillion * tokens) / 1_000_000;
  return (
    perToken(price.input, usage.inputTokens) +
    perToken(price.output, usage.outputTokens) +
    perToken(price.cacheWrite, usage.cacheWriteTokens) +
    perToken(price.cacheRead, usage.cacheReadTokens)
  );
}
