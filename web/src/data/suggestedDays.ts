// Days the calendar suggests adding. Dates come ONLY from official lists, never from an AI (ADR-015).
// Checked 2026-10-03. To add a year: copy its dates from the source named above its list, keep the list sorted by date.

export type SuggestedDay = {
  date: string; // YYYY-MM-DD
  title: string;
  kind: "festival" | "day_of";
  note?: string; // shown with the suggestion
};

// Indian festivals. Source: Department of Personnel & Training (DoP&T), Government of India, holiday lists for central
// government offices (gazetted + restricted holidays, Delhi/New Delhi).
//   2026: O.M. No. 12/2/2023-JCA dated 03.07.2025 — https://www.staffnews.in/2025/07/list-of-holidays-2026-closed-holidays.html
//   2027: O.M. No. 12/2/2023-JCA dated 16.07.2026 — https://www.staffnews.in/2026/07/list-of-holidays-for-the-year-2027-gazetted.html
//         and https://www.staffnews.in/2026/07/list-of-restricted-holidays-for-the-year-2027.html
const MOON_NOTE = "Date follows moon sighting and may move by a day.";

const FESTIVALS: SuggestedDay[] = [
  // 2026 (October to December)
  { date: "2026-10-02", title: "Gandhi Jayanti", kind: "festival" },
  { date: "2026-10-20", title: "Dussehra", kind: "festival" },
  { date: "2026-10-26", title: "Valmiki Jayanti", kind: "festival" },
  { date: "2026-11-08", title: "Diwali", kind: "festival" },
  { date: "2026-11-09", title: "Govardhan Puja", kind: "festival" },
  { date: "2026-11-11", title: "Bhai Dooj", kind: "festival" },
  { date: "2026-11-15", title: "Chhath Puja", kind: "festival" },
  { date: "2026-11-24", title: "Guru Nanak Jayanti", kind: "festival" },
  { date: "2026-12-25", title: "Christmas", kind: "festival" },
  // 2027
  { date: "2027-01-14", title: "Makar Sankranti", kind: "festival" },
  { date: "2027-01-15", title: "Pongal", kind: "festival" },
  { date: "2027-01-26", title: "Republic Day", kind: "festival" },
  { date: "2027-02-11", title: "Basant Panchami", kind: "festival" },
  { date: "2027-03-06", title: "Maha Shivratri", kind: "festival" },
  { date: "2027-03-10", title: "Id-ul-Fitr", kind: "festival", note: MOON_NOTE },
  { date: "2027-03-23", title: "Holi", kind: "festival" },
  { date: "2027-03-26", title: "Good Friday", kind: "festival" },
  { date: "2027-03-28", title: "Easter", kind: "festival" },
  { date: "2027-04-07", title: "Ugadi and Gudi Padwa", kind: "festival" },
  { date: "2027-04-14", title: "Vaisakhi", kind: "festival" },
  { date: "2027-04-15", title: "Ram Navami", kind: "festival" },
  { date: "2027-04-19", title: "Mahavir Jayanti", kind: "festival" },
  { date: "2027-05-17", title: "Id-ul-Zuha", kind: "festival", note: MOON_NOTE },
  { date: "2027-05-20", title: "Buddha Purnima", kind: "festival" },
  { date: "2027-07-05", title: "Rath Yatra", kind: "festival" },
  { date: "2027-08-15", title: "Independence Day", kind: "festival" },
  { date: "2027-08-17", title: "Raksha Bandhan", kind: "festival" },
  { date: "2027-08-25", title: "Janmashtami", kind: "festival" },
  { date: "2027-09-04", title: "Ganesh Chaturthi", kind: "festival" },
  { date: "2027-09-12", title: "Onam", kind: "festival" },
  { date: "2027-10-02", title: "Gandhi Jayanti", kind: "festival" },
  { date: "2027-10-09", title: "Dussehra", kind: "festival" },
  { date: "2027-10-15", title: "Valmiki Jayanti", kind: "festival" },
  { date: "2027-10-29", title: "Diwali", kind: "festival" },
  { date: "2027-10-30", title: "Govardhan Puja", kind: "festival" },
  { date: "2027-10-31", title: "Bhai Dooj", kind: "festival" },
  { date: "2027-11-04", title: "Chhath Puja", kind: "festival" },
  { date: "2027-11-14", title: "Guru Nanak Jayanti", kind: "festival" },
  { date: "2027-12-25", title: "Christmas", kind: "festival" },
];

// Food and farming days that fall on the same date every year. Source: United Nations observances,
// https://www.un.org/en/observances/list-days-weeks (each with its General Assembly resolution).
const YEARLY_DAYS: { monthDay: string; title: string }[] = [
  { monthDay: "02-10", title: "World Pulses Day" },
  { monthDay: "05-12", title: "International Day of Plant Health" },
  { monthDay: "06-07", title: "World Food Safety Day" },
  { monthDay: "09-29", title: "Food Loss and Waste Awareness Day" },
  { monthDay: "10-15", title: "International Day of Rural Women" },
  { monthDay: "10-16", title: "World Food Day" },
  { monthDay: "12-05", title: "World Soil Day" },
];

// The years the yearly days are offered for (the festival list above is what limits us to these years too).
const YEARS_COVERED = [2026, 2027];

export const SUGGESTED_DAYS: SuggestedDay[] = [
  ...FESTIVALS,
  ...YEARS_COVERED.flatMap((year) => YEARLY_DAYS.map((day): SuggestedDay => ({ date: `${year}-${day.monthDay}`, title: day.title, kind: "day_of" }))),
].sort((a, b) => a.date.localeCompare(b.date));
