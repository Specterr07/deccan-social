// Rupees, with a decimal only for small amounts (a single plan costs a few rupees).
export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: amount < 100 ? 1 : 0 })}`;
}
