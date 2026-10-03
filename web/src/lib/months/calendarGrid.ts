export type DayCell = { date: string; day: number } | null; // null = a blank cell before the 1st or after the last day

// Weeks (Monday to Sunday) for a month like "2026-10". Blank cells pad the first and last week.
export function buildMonthGrid(month: string): DayCell[][] {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7; // Monday = 0

  const cells: DayCell[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: `${month}-${String(day).padStart(2, "0")}`, day });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: DayCell[][] = [];
  for (let start = 0; start < cells.length; start += 7) weeks.push(cells.slice(start, start + 7));
  return weeks;
}
