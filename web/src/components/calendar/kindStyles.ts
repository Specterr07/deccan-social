// Labels and chip colours for each kind of post. The label is always shown, so colour is never the only signal.
export const KIND_LABELS: Record<string, string> = {
  festival: "Festival",
  day_of: "Day-of",
  exhibition: "Exhibition",
  informative: "Carousel",
  bts: "Behind the scenes",
};

// Theme colours only (no hex): each kind gets a different tint of the brand palette.
export const KIND_CHIP_CLASSES: Record<string, string> = {
  festival: "border-chart-3 bg-chart-3/15",
  day_of: "border-chart-2 bg-chart-2/15",
  exhibition: "border-chart-1 bg-chart-1/15",
  informative: "border-chart-4 bg-chart-4/10",
  bts: "border-chart-5 bg-chart-5/10",
};

export const KIND_OPTIONS = Object.entries(KIND_LABELS).map(([value, label]) => ({ value, label }));
