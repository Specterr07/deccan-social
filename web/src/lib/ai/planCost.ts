// Rough price of planning a month, for the "Plan N posts" dialog. Measured on Sonnet 5.5 (T-03c): about $0.05 for 6 posts,
// of which a small fixed part is the shared instructions. Only an estimate; the real cost is logged in ai_calls.
const FIXED_USD = 0.01;
const PER_POST_USD = 0.007;

export function estimatePlanCostUsd(postCount: number): number {
  return FIXED_USD + PER_POST_USD * postCount;
}
