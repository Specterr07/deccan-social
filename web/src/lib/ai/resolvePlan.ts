import type { EntryWithImage } from "@/lib/entries/queries";
import { asExhibitionDetails, asInformativeDetails, exhibitionDateBoxes, requiredImageFor } from "@/lib/entries/entryFacts";
import type { AnswerPost, MonthPlan, PlanAnswerData, PlanPost, PlanSlide } from "@/schemas/plan";
import type { PlanProblem } from "@/schemas/planRules";
import { DEFAULT_POST_TIME, type PostKind } from "@/schemas/limits";

// Claude writes the words; this file adds the facts. Dates, times, formats, exhibition days / city / stand and the
// required images always come from the calendar entry the person typed, so Claude can never change or invent them.

// Does Claude's answer contain exactly one post per entry? Problems here are about the whole plan, not one post.
export function checkCoverage(answer: PlanAnswerData, entries: EntryWithImage[]): PlanProblem[] {
  const problems: PlanProblem[] = [];
  const knownIds = new Set(entries.map((entry) => entry.id));
  const seen = new Set<string>();
  for (const post of answer.posts) {
    if (!knownIds.has(post.entry_id)) problems.push({ path: ["posts"], message: `a post uses entry_id "${post.entry_id}", which is not in the calendar` });
    else if (seen.has(post.entry_id)) problems.push({ path: ["posts"], message: `two posts use the same entry_id "${post.entry_id}"` });
    seen.add(post.entry_id);
  }
  for (const entry of entries) {
    if (!seen.has(entry.id)) problems.push({ path: ["posts"], message: `no post was written for "${entry.title}" (${entry.date})` });
  }
  return problems;
}

// The slide the facts belong on: exhibition details and required images go on the first (only) slide of a single-image post.
function resolveSlide(slide: AnswerPost["slides"][number], entry: EntryWithImage, isFirst: boolean): PlanSlide {
  if (!isFirst) return slide;
  const required = requiredImageFor(entry.kind, entry.title);
  const exhibition = entry.kind === "exhibition" ? asExhibitionDetails(entry.details) : null;
  return {
    ...slide,
    ...(exhibition ? { dates: exhibitionDateBoxes(exhibition), venue: exhibition.city, stand: exhibition.stand } : {}),
    ...(required ? { required_image: required } : {}),
  };
}

// Turns Claude's answer into a full plan by adding the entries' facts. Call only after `checkCoverage` found nothing.
export function resolvePlan(answer: PlanAnswerData, entries: EntryWithImage[], month: string): MonthPlan {
  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  const resolvedPosts = answer.posts.map((post): PlanPost => {
    const entry = entryById.get(post.entry_id)!; // present: checkCoverage already confirmed it
    const chosenFruit = entry.kind === "informative" ? asInformativeDetails(entry.details).fruit : undefined;
    return {
      entry_id: entry.id,
      date: entry.date,
      time: entry.time ? entry.time.slice(0, 5) : DEFAULT_POST_TIME,
      kind: entry.kind as PostKind,
      fruit: chosenFruit ?? post.fruit,
      aspect: entry.aspect as "4:5" | "1:1",
      platforms: entry.platforms as ("instagram" | "linkedin")[],
      caption_instagram: post.caption_instagram,
      caption_linkedin: post.caption_linkedin,
      rationale: post.rationale,
      slides: post.slides.map((slide, index) => resolveSlide(slide, entry, index === 0)),
    };
  });
  return { month, posts: resolvedPosts };
}

// A carousel must have the number of slides the person asked for. Returns problems at post level so a fix call can repair them.
export function checkSlideCounts(plan: MonthPlan, entries: EntryWithImage[]): PlanProblem[] {
  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  const problems: PlanProblem[] = [];
  plan.posts.forEach((post, postIndex) => {
    const entry = entryById.get(post.entry_id);
    if (entry?.kind !== "informative") return;
    const wanted = asInformativeDetails(entry.details).slideCount;
    if (post.slides.length !== wanted) problems.push({ path: ["posts", postIndex, "slides"], message: `the calendar asks for ${wanted} slides, the post has ${post.slides.length}` });
  });
  return problems;
}
