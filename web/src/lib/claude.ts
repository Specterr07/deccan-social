import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { env } from "@/env";
import { monthPlanShape, type MonthPlan } from "@/schemas/plan";
import { checkMonthPlan, describeProblems } from "@/schemas/planRules";
import { buildPlanSystemPrompt } from "./planPrompt";

const MAX_OUTPUT_TOKENS = 16000; // a 12-post plan with captions is ~6-8k tokens; leaves headroom without needing streaming

const globalForClaude = globalThis as unknown as { anthropic?: Anthropic };
const anthropic = globalForClaude.anthropic ?? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
if (process.env.NODE_ENV !== "production") globalForClaude.anthropic = anthropic;

type Conversation = Anthropic.MessageParam[];

// Asks Claude once and returns its raw JSON text. Throws readable errors for refusals and cut-off answers.
async function askForPlan(messages: Conversation): Promise<{ text: string; assistantContent: Anthropic.ContentBlock[] }> {
  let response: Anthropic.Message;
  try {
    response = await anthropic.messages.create({
      model: env.CLAUDE_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: buildPlanSystemPrompt(),
      messages,
      output_config: { effort: "medium", format: zodOutputFormat(monthPlanShape) },
    });
  } catch (error) {
    // Network drops, an invalid API key, rate limits or an overloaded API all land here.
    throw new Error(`The Claude API call failed: ${(error as Error).message}`);
  }

  console.info(`Claude plan call: ${response.usage.input_tokens} in / ${response.usage.output_tokens} out tokens (${env.CLAUDE_MODEL})`);
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

// Parses Claude's JSON and checks it against the shape and the content limits.
// Returns the plan, or a list of readable problems when something is wrong.
function checkAnswer(text: string): { plan: MonthPlan } | { problems: string[] } {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    // Structured output should always be valid JSON; if not, the answer was damaged.
    return { problems: ["The answer was not valid JSON."] };
  }
  const shape = monthPlanShape.safeParse(parsedJson);
  if (!shape.success) {
    return { problems: shape.error.issues.map((issue) => `${issue.path.join(".")} → ${issue.message}`) };
  }
  const limitProblems = checkMonthPlan(shape.data);
  if (limitProblems.length > 0) return { problems: describeProblems(shape.data, limitProblems) };
  return { plan: shape.data };
}

// Reads the calendar PDF with Claude and returns a validated plan for the month.
// If the first answer breaks a limit, Claude gets the problem list once and is asked to correct it.
export async function planMonth(pdf: Buffer, month: string): Promise<MonthPlan> {
  const firstMessage: Anthropic.MessageParam = {
    role: "user",
    content: [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf.toString("base64") } },
      { type: "text", text: `Plan the posts for ${month} from this calendar.` },
    ],
  };

  const first = await askForPlan([firstMessage]);
  const firstCheck = checkAnswer(first.text);
  if ("plan" in firstCheck) return firstCheck.plan;

  const retryMessages: Conversation = [
    firstMessage,
    { role: "assistant", content: first.assistantContent },
    { role: "user", content: `Your plan breaks these rules:\n${firstCheck.problems.map((line) => `- ${line}`).join("\n")}\n\nReturn the full corrected plan.` },
  ];
  const second = await askForPlan(retryMessages);
  const secondCheck = checkAnswer(second.text);
  if ("plan" in secondCheck) return secondCheck.plan;

  // Still wrong after one correction: fail loudly with the exact problems so the month page can show them.
  throw new Error(`Claude's plan still broke the content limits:\n${secondCheck.problems.map((line) => `• ${line}`).join("\n")}`);
}
