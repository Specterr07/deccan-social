import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { env } from "@/env";
import { monthPlanShape, type MonthPlan } from "@/schemas/plan";
import { checkMonthPlan, describeProblems } from "@/schemas/planRules";
import { callClaude, type AiPurpose } from "./callClaude";
import { buildPlanSystemPrompt } from "./planPrompt";

const MAX_OUTPUT_TOKENS = 16000; // a 12-post plan with captions is ~6-8k tokens; leaves headroom without needing streaming
// Effort must be IDENTICAL on the first call and the fix call: changing it invalidates the prompt cache.
export type PlanEffort = "low" | "medium";
export const DEFAULT_PLAN_EFFORT: PlanEffort = "medium";

export type PlanContext = { monthId?: string; effort?: PlanEffort };
type Conversation = Anthropic.MessageParam[];
export type PlanAnswer = { text: string; assistantContent: Anthropic.ContentBlock[] };

// The calendar PDF plus the instruction. The PDF block is cached so the fix call reads it at 10% of the price.
export function buildFirstMessage(pdf: Buffer, month: string): Anthropic.MessageParam {
  return {
    role: "user",
    content: [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf.toString("base64") }, cache_control: { type: "ephemeral" } },
      { type: "text", text: `Plan the posts for ${month} from this calendar.` },
    ],
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
    output_config: { effort: context.effort ?? DEFAULT_PLAN_EFFORT, format: zodOutputFormat(monthPlanShape) },
  });
  if (response.stop_reason === "refusal") {
    throw new Error("Claude declined to plan this calendar. Check the PDF contains only the calendar and try again.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("Claude's plan was cut off because it was too long. Try a calendar with fewer posts.");
  }
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Claude returned no plan text.");
  return { text: textBlock.text, assistantContent: response.content };
}

// Parses Claude's JSON and checks the shape only (the content limits are checked separately).
export function parsePlanJson(text: string): { plan: MonthPlan } | { problems: string[] } {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    // Structured output should always be valid JSON; if not, the answer was damaged.
    return { problems: ["The answer was not valid JSON."] };
  }
  const shape = monthPlanShape.safeParse(parsedJson);
  if (!shape.success) return { problems: shape.error.issues.map((issue) => `${issue.path.join(".")} → ${issue.message}`) };
  return { plan: shape.data };
}

// Asks Claude to correct ONLY the broken posts (not the whole plan), then merges them back in.
// `brokenIndexes` are positions in plan.posts; the answer must contain exactly those posts, in order.
export async function repairPosts(
  firstMessage: Anthropic.MessageParam, first: PlanAnswer, plan: MonthPlan,
  brokenIndexes: number[], problemLines: string[], context: PlanContext,
): Promise<MonthPlan> {
  const messages: Conversation = [
    firstMessage,
    { role: "assistant", content: first.assistantContent },
    { role: "user", content: `These posts break the rules:\n${problemLines.map((line) => `- ${line}`).join("\n")}\n\nReturn a plan with the same month and ONLY the corrected versions of these ${brokenIndexes.length} post(s), in the same order. Fix only what breaks a rule; keep everything else exactly as it was.` },
  ];
  const answer = await askForPlan(messages, "plan_fix", context);
  const parsed = parsePlanJson(answer.text);
  if ("problems" in parsed) throw new Error(`Claude's corrected posts were not usable:\n${parsed.problems.map((line) => `• ${line}`).join("\n")}`);

  const fixedPosts = parsed.plan.posts;
  const datesMatch = fixedPosts.length === brokenIndexes.length && fixedPosts.every((post, order) => post.date === plan.posts[brokenIndexes[order]].date);
  if (!datesMatch) throw new Error("Claude's corrected posts did not match the posts that needed fixing.");

  const posts = [...plan.posts];
  brokenIndexes.forEach((postIndex, order) => { posts[postIndex] = fixedPosts[order]; });
  return { ...plan, posts };
}

// Reads the calendar PDF with Claude and returns a validated plan for the month.
// If a few posts break a limit, Claude is asked once to fix just those posts.
export async function planMonth(pdf: Buffer, month: string, context: PlanContext = {}): Promise<MonthPlan> {
  const firstMessage = buildFirstMessage(pdf, month);
  const first = await askForPlan([firstMessage], "plan_month", context);
  const parsed = parsePlanJson(first.text);
  if ("problems" in parsed) throw new Error(`Claude's answer was not a usable plan:\n${parsed.problems.map((line) => `• ${line}`).join("\n")}`);

  const problems = checkMonthPlan(parsed.plan);
  if (problems.length === 0) return parsed.plan;

  // Problems about the plan as a whole (wrong month, no posts, too many posts) cannot be fixed post by post.
  const postLevelOnly = problems.every((problem) => problem.path[0] === "posts" && typeof problem.path[1] === "number");
  if (!postLevelOnly) throw new Error(`The plan has problems Claude cannot fix one post at a time:\n${describeProblems(parsed.plan, problems).map((line) => `• ${line}`).join("\n")}`);

  const brokenIndexes = [...new Set(problems.map((problem) => problem.path[1] as number))].sort((a, b) => a - b);
  const repaired = await repairPosts(firstMessage, first, parsed.plan, brokenIndexes, describeProblems(parsed.plan, problems), context);

  const remaining = checkMonthPlan(repaired);
  if (remaining.length > 0) {
    // Still wrong after one correction: fail loudly with the exact problems so the month page can show them.
    throw new Error(`Claude's plan still broke the content limits:\n${describeProblems(repaired, remaining).map((line) => `• ${line}`).join("\n")}`);
  }
  return repaired;
}
