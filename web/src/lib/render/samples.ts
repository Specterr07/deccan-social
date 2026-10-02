import type { RenderInput } from "./types";

// Sample slides for the /dev/templates page. They mirror the text in brand/templates/*.html so the
// renders can be compared with brand/templates/*.png. `reference` is that PNG (when one exists).
export type RenderSample = { label: string; reference?: string; input: RenderInput };

const dualDates = [{ day: "02", month: "SEP" }, { day: "03", month: "SEP" }, { day: "04", month: "SEP" }];

export const renderSamples: Record<string, RenderSample> = {
  festival: {
    label: "Festival",
    reference: "festival-post.png",
    input: {
      template: "festival", fruit: "none", aspect: "4:5", photoUrl: "/brand/sample-photos/tropical.jpg",
      eyebrow: "Happy", hero: "Dussehra",
      body: "May the victory of good bring a season of abundance to our partners, growers and families.",
    },
  },
  "festival-square": {
    label: "Festival (1:1)",
    input: {
      template: "festival", fruit: "none", aspect: "1:1", photoUrl: "/brand/sample-photos/tropical.jpg",
      eyebrow: "Happy", hero: "Dussehra",
      body: "May the victory of good bring a season of abundance to our partners, growers and families.",
    },
  },
  "day-of": {
    label: "Day-of",
    reference: "day-of-post.png",
    input: {
      template: "day_of", fruit: "mango", aspect: "4:5", photoUrl: "/brand/sample-photos/tropical.jpg",
      eyebrow: "Happy National", hero: "Mango Day",
      body: "Celebrating the king of fruits, from Indian orchards to tables across the world.",
    },
  },
  "day-of-square": {
    label: "Day-of (1:1)",
    input: {
      template: "day_of", fruit: "mango", aspect: "1:1", photoUrl: "/brand/sample-photos/tropical.jpg",
      eyebrow: "Happy National", hero: "Mango Day",
      body: "Celebrating the king of fruits, from Indian orchards to tables across the world.",
    },
  },
  exhibition: {
    label: "Exhibition",
    reference: "exhibition-post.png",
    input: {
      template: "exhibition", fruit: "none", aspect: "4:5", photoUrl: "/brand/sample-photos/tropical.jpg",
      eyebrow: "Let's connect at", hero: "World Fresh Produce Expo",
      dates: dualDates, venue: "Hong Kong", stand: "Hall 3 · Stand B12",
    },
  },
  "behind-the-scenes": {
    label: "Behind the scenes",
    reference: "behind-the-scenes-post.png",
    input: {
      template: "behind_the_scenes", fruit: "none", aspect: "4:5", photoUrl: "/brand/sample-photos/packhouse.jpg",
      eyebrow: "Inside our packhouse", hero: "Behind every perfect bunch are dedicated hands.",
    },
  },
  "carousel-cover": {
    label: "Carousel cover",
    reference: "info-carousel-cover.png",
    input: {
      template: "info_cover", fruit: "pomegranate", aspect: "4:5", photoUrl: "/brand/sample-photos/arils.jpg",
      hero: "Why October matters for Indian pomegranates", sub: "Peak harvest. Deep colour. Export-ready.",
    },
  },
  "carousel-inner": {
    label: "Carousel inner",
    reference: "info-carousel-inner.png",
    input: {
      template: "info_inner", fruit: "pomegranate", aspect: "4:5", photoUrl: "/brand/sample-photos/orchard.jpg",
      eyebrow: "01 · Season", hero: "Peak export season",
      body: "Fresh harvests begin across Maharashtra and Karnataka, so supply is steady and grading is consistent.",
      progress: { index: 1, total: 4 },
    },
  },
  "carousel-cta": {
    label: "Carousel CTA",
    reference: "info-carousel-cta.png",
    input: {
      template: "info_cta", fruit: "pomegranate", aspect: "4:5", photoUrl: "/brand/sample-photos/pomegranate-cut.jpg",
      eyebrow: "Work with us", hero: "Looking for a reliable pomegranate exporter?",
      checklist: ["Careful grading and packing", "Consistent supply all season", "FOB and custom export terms"],
    },
  },
  "long-hero": {
    label: "Stress test: very long headline",
    input: {
      template: "behind_the_scenes", fruit: "none", aspect: "4:5", photoUrl: "/brand/sample-photos/packhouse.jpg",
      eyebrow: "Inside our packhouse",
      hero: "Behind every single perfect bunch of grapes that leaves our packhouse are dedicated hands, careful eyes and a whole season of patient work.",
    },
  },
  "no-photo": {
    label: "Stress test: no photo",
    input: {
      template: "info_inner", fruit: "grape", aspect: "4:5", eyebrow: "02 · Grading", hero: "Sorted by hand",
      body: "Every bunch is checked for colour, size and sweetness before it is packed.", progress: { index: 1, total: 3 },
    },
  },
};
