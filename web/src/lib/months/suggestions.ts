import { SUGGESTED_DAYS, type SuggestedDay } from "@/data/suggestedDays";

// Suggestions for one month ("YYYY-MM"), minus ones the person dismissed and ones already on the calendar.
export function suggestionsForMonth(month: string, dismissedTitles: string[], entries: { date: string; title: string }[]): SuggestedDay[] {
  return SUGGESTED_DAYS.filter((day) =>
    day.date.startsWith(month)
    && !dismissedTitles.includes(day.title)
    && !entries.some((entry) => entry.date === day.date && entry.title.toLowerCase() === day.title.toLowerCase()));
}

// Finds a suggestion in the data file. The browser only names it; the kind and date always come from here.
export function findSuggestion(month: string, date: string, title: string): SuggestedDay | null {
  return SUGGESTED_DAYS.find((day) => day.date === date && day.title === title && day.date.startsWith(month)) ?? null;
}
