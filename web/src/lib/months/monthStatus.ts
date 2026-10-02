// Month statuses and the plain words shown to the reviewer (a status is never shown as colour alone).
export const MONTH_STATUS = {
  planning: "Planning",
  planned: "Planned",
  failed: "Needs attention",
} as const;

export type MonthStatus = keyof typeof MONTH_STATUS;

// If a plan job has been "planning" longer than this, the server probably restarted mid-way.
export const STALE_PLANNING_MINUTES = 10;

export function monthStatusLabel(status: string): string {
  return status in MONTH_STATUS ? MONTH_STATUS[status as MonthStatus] : status;
}

// "2026-10" → "October 2026"
export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function calendarKeyFor(monthId: string): string {
  return `calendars/${monthId}.pdf`;
}
