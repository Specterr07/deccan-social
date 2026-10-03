import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { env } from "@/env";
import type { EntryWithImage } from "@/lib/entries/queries";
import { asExhibitionDetails, asInformativeDetails } from "@/lib/entries/entryFacts";
import { planAnswerShape, type MonthPlan, type PlanAnswerData } from "@/schemas/plan";
import { checkMonthPlan, describeProblems, type PlanProblem } from "@/schemas/planRules";
import { callClaude, type AiPurpose } from "./callClaude";
import { buildPlanSystemPrompt } from "./planPrompt";
import { checkCoverage, checkSlideCounts, resolvePlan } from "./resolvePlan";

const MAX_OUTPUT_TOKENS = 16000; // a 12-post plan with captions is ~6-8k tokens; leaves headroom without needing streaming
// Effort must be IDENTICAL on the first call and the fix call: changing it invalidates the prompt cache.
export type PlanEffort = "low" | "medium";
export const DEFAULT_PLAN_EFFORT: PlanEffort = "medium";

export type PlanContext = { monthId?: string; effort?: PlanEffort };
type Conversation = Anthropic.MessageParam[];
export type PlanAnswer = { text: string; assistantContent: Anthropic.ContentBlock[] };

// The facts Claude may use, as compact JSON (no ids of images, no internal fields).
function describeEntry(entry: EntryWithImage) {
  const exhibition = entry.kind === "exhibition" ? asExhibitionDetails(entry.details) : null;
  const informative = entry.kind === "informative" ? asInformativeDetails(entry.details) : null;
  return {
    entry_id: entry.id, date: entry.date, kind: entry.kind, title: entry.title, notes: entry.notes ?? undefined,
    exhibition: exhibition ? { first_day: exhibition.firstDay, last_day: exhibition.lastDay, city: exhibition.city, stand: exhibition.stand } : undefined,
    informative: informative ? { fruit: informative.fruit, points: informative.points, slide_count: informative.slideCount } : undefined,
  };
}

// The entries plus the instruction. The block is cached so the fix call reads it at 10% of the price.
export function buildFirstMessage(entries: EntryWithImage[], month: string): Anthropic.MessageParam {
  const calendar = JSON.stringify({ month, entries: entries.map(describeEntry) });
  return {
    role: "user",
    content: [{ type: "text", text: `Write the posts for ${month}. One post per entry.\n\n${calendar}`, cache_control: { type: "ephemeral" } }],
  };
}

// One Claude call (logged in ai_calls). Throws readable errors for refusals and cut-off answers.
export async function askForPlan(messages: Conversation, purpose: AiPurpose, context: PlanContext): Promise<PlanAnswer> {
  const response = await callClaude({
    purpose,
    monthId: context.monthId,
    model: env.CLAUDE_MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: [{ type: "text", text: buildPlanSystemPrompt(), cache_control: { type: "ephemeral" } }],
    messages,
    output_config: { effort: context.effort ?? DEFAULT_PLAN_EFFORT, format: zodOutputFormat(planAnswerShape) },
  });
  if (response.stop_reason === "refusal") {
    throw new Error("Claude declined to write these posts. Check the notes on your calendar entries and try again.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("Claude's answer was cut off because it was too long. Try a month with fewer posts.");
  }
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Claude returned no text.");
  return { text: textBlock.text, assistantContent: response.content };
}

// Parses Claude's JSON and checks the shape only (the content limits are checked separately).
export function parseAnswerJson(text: string): { answer: PlanAnswerData } | { problems: string[] } {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    // Structured output should always be valid JSON; if not, the answer was damaged.
    return { problems: ["The answer was not valid JSON."] };
  }
  const shape = planAnswerShape.safeParse(parsedJson);
  if (!shape.success) return { problems: shape.error.issues.map((issue) => `${issue.path.join(".")} → ${issue.message}`) };
  return { answer: shape.data };
}

function bulletList(lines: string[]): string {
  return lines.map((line) => `• ${line}`).join("\n");
}

// Resolves the answer against the entries and runs every check. Returns the full plan plus all problems found.
function resolveAndCheck(answer: PlanAnswerData, entries: EntryWithImage[], month: string): { plan: MonthPlan | null; problems: PlanProblem[] } {
  const coverageProblems = checkCoverage(answer, entries);
  if (coverageProblems.length > 0) return { plan: null, problems: coverageProblems };
  const plan = resolvePlan(answer, entries, month);
  return { plan, problems: [...checkMonthPlan(plan), ...checkSlideCounts(plan, entries)] };
}

// Asks Claude to correct ONLY the broken posts (not everything), then merges them back by entry_id.
async function repairPosts(
  firstMessage: Anthropic.MessageParam, first: PlanAnswer, answer: PlanAnswerData,
  brokenIndexes: number[], problemLines: string[], context: PlanContext,
): Promise<PlanAnswerData> {
  const brokenIds = brokenIndexes.map((index) => answer.posts[index].entry_id);
  const messages: Conversation = [
    firstMessage,
    { role: "assistant", content: first.assistantContent },
    { role: "user", content: `These posts break the rules:\n${problemLines.map((line) => `- ${line}`).join("\n")}\n\nReturn ONLY the corrected versions of these ${brokenIds.length} post(s) (entry_id: ${brokenIds.join(", ")}). Fix only what breaks a rule; keep everything else exactly as it was.` },
  ];
  const answerFix = await askForPlan(messages, "plan_fix", context);
  const parsed = parseAnswerJson(answerFix.text);
  if ("problems" in parsed) throw new Error(`Claude's corrected posts were not usable:\n${bulletList(parsed.problems)}`);

  const fixedIds = parsed.answer.posts.map((post) => post.entry_id);
  const sameSet = fixedIds.length === brokenIds.length && brokenIds.every((id) => fixedIds.includes(id));
  if (!sameSet) throw new Error("Claude's corrected posts did not match the posts that needed fixing.");

  const posts = [...answer.posts];
  brokenIndexes.forEach((postIndex) => { posts[postIndex] = parsed.answer.posts.find((post) => post.entry_id === answer.posts[postIndex].entry_id)!; });
  return { posts };
}

// Writes the month's posts from its calendar entries and returns a validated plan (facts copied from the entries).
// If a few posts break a limit, Claude is asked once to fix just those posts.
export async function planMonth(entries: EntryWithImage[], month: string, context: PlanContext = {}): Promise<MonthPlan> {
  if (entries.length === 0) throw new Error("There are no posts in the calendar yet. Add at least one post first.");
  const firstMessage = buildFirstMessage(entries, month);
  const first = await askForPlan([firstMessage], "plan_month", context);
  const parsed = parseAnswerJson(first.text);
  if ("problems" in parsed) throw new Error(`Claude's answer was not a usable plan:\n${bulletList(parsed.problems)}`);

  const checked = resolveAndCheck(parsed.answer, entries, month);
  if (checked.plan && checked.problems.length === 0) return checked.plan;

  // Problems about the plan as a whole (a missing or duplicate post) cannot be fixed post by post.
  const postLevelOnly = checked.plan && checked.problems.every((problem) => problem.path[0] === "posts" && typeof problem.path[1] === "number");
  if (!checked.plan || !postLevelOnly) {
    throw new Error(`The plan has problems Claude cannot fix one post at a time:\n${bulletList(describeProblems(checked.plan, checked.problems))}`);
  }

  const brokenIndexes = [...new Set(checked.problems.map((problem) => problem.path[1] as number))].sort((a, b) => a - b);
  const repairedAnswer = await repairPosts(firstMessage, first, parsed.answer, brokenIndexes, describeProblems(checked.plan, checked.problems), context);

  const recheck = resolveAndCheck(repairedAnswer, entries, month);
  if (!recheck.plan || recheck.problems.length > 0) {
    // Still wrong after one correction: fail loudly with the exact problems so the month page can show them.
    throw new Error(`Claude's plan still broke the content limits:\n${bulletList(describeProblems(recheck.plan, recheck.problems))}`);
  }
  return recheck.plan;
}
