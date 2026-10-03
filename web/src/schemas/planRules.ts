import { DEFAULT_POST_TIME, LIMITS, heroLimit } from "./limits";
import type { MonthPlan, PlanPost, PlanSlide } from "./plan";
import type { PostKind } from "./limits";

// Checks a plan against docs/CONTENT-LIMITS.md. Returns a list of plain-English problems
// (with the path of the offending field) instead of throwing, so we can show them or send them back to Claude.

export type PlanProblem = { path: (string | number)[]; message: string };

const SINGLE_IMAGE_KINDS: PostKind[] = ["festival", "day_of", "exhibition", "bts"];
const DEITY_WORDS = /\b(ganesh|ganesha|durga|rama|lakshmi|krishna|shiva|hanuman|deity|goddess)\b/i;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countHashtags(text: string): number {
  return (text.match(/#\w+/g) ?? []).length;
}

// "hero is 24 characters, the limit is 18"
function tooLong(field: string, value: string, limit: number): string | null {
  return value.length > limit ? `${field} is ${value.length} characters, the limit is ${limit}` : null;
}

function checkSlide(post: PlanPost, slide: PlanSlide, postIndex: number, slideIndex: number): PlanProblem[] {
  const path = ["posts", postIndex, "slides", slideIndex];
  const problems: PlanProblem[] = [];
  const add = (field: string, message: string | null) => {
    if (message) problems.push({ path: [...path, field], message });
  };

  add("hero", tooLong("hero", slide.hero, heroLimit(post.kind, slide.variant)));
  if (!slide.hero.trim()) add("hero", "hero is empty");
  if (slide.eyebrow) add("eyebrow", tooLong("eyebrow", slide.eyebrow, LIMITS.eyebrow));
  if (slide.sub) add("sub", tooLong("sub", slide.sub, LIMITS.sub));

  const isGreeting = post.kind === "festival" || post.kind === "day_of";
  if (isGreeting && !slide.body) add("body", "body (the greeting line) is required for festival and day-of posts");
  if (slide.body && isGreeting) add("body", tooLong("body", slide.body, LIMITS.bodyGreeting));
  if (slide.body && post.kind === "informative") {
    add("body", tooLong("body", slide.body, LIMITS.bodyInner));
    if (countWords(slide.body) > LIMITS.bodyInnerWords) {
      add("body", `body is ${countWords(slide.body)} words, the limit is ${LIMITS.bodyInnerWords}`);
    }
  }
  if (slide.variant === "inner" && !slide.body) add("body", "inner carousel slides need a body");

  if (slide.variant === "cta") {
    const items = slide.checklist ?? [];
    if (items.length < LIMITS.checklistItems.min || items.length > LIMITS.checklistItems.max) {
      add("checklist", `checklist has ${items.length} items, it needs ${LIMITS.checklistItems.min}-${LIMITS.checklistItems.max}`);
    }
    items.forEach((item) => add("checklist", tooLong(`checklist item "${item}"`, item, LIMITS.checklistItemChars)));
  }

  if (slide.dates && (slide.dates.length < LIMITS.dates.min || slide.dates.length > LIMITS.dates.max)) {
    add("dates", `dates has ${slide.dates.length} boxes, it needs ${LIMITS.dates.min}-${LIMITS.dates.max}`);
  }
  if (slide.venue) add("venue", tooLong("venue", slide.venue, LIMITS.venue));
  if (slide.stand) add("stand", tooLong("stand", slide.stand, LIMITS.stand));

  checkRequiredImage(post, slide).forEach(([field, message]) => add(field, message));

  const tagCount = slide.photo_tags.length;
  if (tagCount < LIMITS.photoTags.min || tagCount > LIMITS.photoTags.max) {
    add("photo_tags", `photo_tags has ${tagCount} tags, it needs ${LIMITS.photoTags.min}-${LIMITS.photoTags.max}`);
  }
  if (slide.artwork_prompt) {
    add("artwork_prompt", tooLong("artwork_prompt", slide.artwork_prompt, LIMITS.artworkPrompt));
    if (DEITY_WORDS.test(slide.artwork_prompt)) add("artwork_prompt", "artwork_prompt mentions a deity or festival figure; never generate those");
  }
  return problems;
}

// Which slides must (or must not) carry a required image, and its text limits. Returns [field, message] pairs.
function checkRequiredImage(post: PlanPost, slide: PlanSlide): [string, string][] {
  const image = slide.required_image;
  const problems: [string, string][] = [];
  if (post.kind === "exhibition" && image?.kind !== "event_logo") problems.push(["required_image", 'exhibition slides need required_image kind "event_logo"']);
  if (post.kind === "bts" && image?.kind !== "specific") problems.push(["required_image", 'behind-the-scenes slides need required_image kind "specific" (a real photo)']);
  if (!image) return problems;
  if (image.kind === "event_logo" && post.kind !== "exhibition") problems.push(["required_image", '"event_logo" is only for exhibition posts']);
  const descriptionProblem = tooLong("required_image description", image.description, LIMITS.requiredImageDescription);
  if (descriptionProblem) problems.push(["required_image", descriptionProblem]);
  if (!image.description.trim()) problems.push(["required_image", "required_image description is empty"]);
  const nameProblem = image.library_name ? tooLong("required_image library_name", image.library_name, LIMITS.libraryName) : null;
  if (nameProblem) problems.push(["required_image", nameProblem]);
  return problems;
}

// The slide list must have the right shape for the kind of post.
function checkSlideShape(post: PlanPost, postIndex: number): PlanProblem[] {
  const path = ["posts", postIndex, "slides"];
  const variants = post.slides.map((slide) => slide.variant);

  if (SINGLE_IMAGE_KINDS.includes(post.kind)) {
    const ok = variants.length === 1 && variants[0] === "single";
    return ok ? [] : [{ path, message: `${post.kind} posts need exactly 1 slide with variant "single"` }];
  }
  const { min, max } = LIMITS.carouselSlides;
  const inner = variants.slice(1, -1);
  const ok = variants.length >= min && variants.length <= max && variants[0] === "cover"
    && variants[variants.length - 1] === "cta" && inner.every((variant) => variant === "inner");
  return ok ? [] : [{ path, message: `a carousel needs ${min}-${max} slides: one "cover", then "inner" slides, then one "cta" (got ${variants.join(", ") || "none"})` }];
}

function checkPost(post: PlanPost, postIndex: number, month: string): PlanProblem[] {
  const path = ["posts", postIndex];
  const problems: PlanProblem[] = [];
  const add = (field: string, message: string | null) => {
    if (message) problems.push({ path: [...path, field], message });
  };

  const isRealDate = /^\d{4}-\d{2}-\d{2}$/.test(post.date) && !Number.isNaN(Date.parse(post.date));
  if (!isRealDate) add("date", `date "${post.date}" is not a real YYYY-MM-DD date`);
  else if (!post.date.startsWith(month)) add("date", `date ${post.date} is outside the month ${month}`);
  if (post.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(post.time)) add("time", `time "${post.time}" must look like ${DEFAULT_POST_TIME}`);
  if (post.aspect === "1:1" && post.kind !== "festival" && post.kind !== "day_of") add("aspect", "1:1 is only supported for festival and day-of posts");
  if (post.platforms.length === 0) add("platforms", "platforms is empty");

  const ig = post.caption_instagram;
  const li = post.caption_linkedin;
  const rangeProblem = (name: string, text: string, chars: { min: number; max: number }, tags: { min: number; max: number }) => {
    if (text.length < chars.min || text.length > chars.max) return `${name} is ${text.length} characters, it needs ${chars.min}-${chars.max}`;
    const hashtagCount = countHashtags(text);
    if (hashtagCount < tags.min || hashtagCount > tags.max) return `${name} has ${hashtagCount} hashtags, it needs ${tags.min}-${tags.max}`;
    return null;
  };
  add("caption_instagram", rangeProblem("caption_instagram", ig, LIMITS.captionInstagram, LIMITS.hashtagsInstagram));
  add("caption_linkedin", rangeProblem("caption_linkedin", li, LIMITS.captionLinkedin, LIMITS.hashtagsLinkedin));
  add("rationale", tooLong("rationale", post.rationale, LIMITS.rationale));

  problems.push(...checkSlideShape(post, postIndex));
  post.slides.forEach((slide, slideIndex) => problems.push(...checkSlide(post, slide, postIndex, slideIndex)));
  return problems;
}

export function checkMonthPlan(plan: MonthPlan): PlanProblem[] {
  const problems: PlanProblem[] = [];
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(plan.month)) problems.push({ path: ["month"], message: `month "${plan.month}" must look like 2026-10` });
  if (plan.posts.length === 0) problems.push({ path: ["posts"], message: "the plan has no posts" });
  if (plan.posts.length > LIMITS.postsPerMonth) problems.push({ path: ["posts"], message: `the plan has ${plan.posts.length} posts, the limit is ${LIMITS.postsPerMonth}` });
  plan.posts.forEach((post, postIndex) => problems.push(...checkPost(post, postIndex, plan.month)));
  return problems;
}

// Turns problems into readable lines like: Post 3 (Dussehra, 2026-10-20) → hero is 24 characters, the limit is 18
export function describeProblems(plan: MonthPlan | null, problems: PlanProblem[]): string[] {
  return problems.map((problem) => {
    const postIndex = problem.path[0] === "posts" ? Number(problem.path[1]) : null;
    const post = postIndex !== null && plan ? plan.posts[postIndex] : undefined;
    const label = post ? `Post ${postIndex! + 1} (${post.slides[0]?.hero ?? post.kind}, ${post.date})` : "Plan";
    return `${label} → ${problem.message}`;
  });
}
