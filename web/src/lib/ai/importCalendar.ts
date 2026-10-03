import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { env } from "@/env";
import { importAnswerShape, type ImportRow } from "@/schemas/importRows";
import { callClaude } from "./callClaude";
import { buildImportSystemPrompt } from "./importPrompt";

const MAX_OUTPUT_TOKENS = 8000; // 31 rows of plain facts is well under this

// Reads a calendar PDF with Claude (logged in ai_calls as import_pdf) and returns one row per post.
// Throws readable errors for refusals, cut-off answers and unusable output.
export async function readCalendarPdf(pdf: Buffer, month: string, monthId: string): Promise<ImportRow[]> {
  const response = await callClaude({
    purpose: "import_pdf",
    monthId,
    model: env.CLAUDE_MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: buildImportSystemPrompt(),
    messages: [{
      role: "user",
      content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf.toString("base64") } },
        { type: "text", text: `This calendar is for ${month}. Copy every planned post into a row.` },
      ],
    }],
    output_config: { effort: "low", format: zodOutputFormat(importAnswerShape) }, // copying facts needs little thinking
  });

  if (response.stop_reason === "refusal") throw new Error("Claude declined to read this PDF. Check that it is the calendar.");
  if (response.stop_reason === "max_tokens") throw new Error("Claude's answer was cut off. Try a calendar with fewer rows.");
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Claude returned no text.");

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(textBlock.text);
  } catch {
    // Structured output should always be valid JSON; if not, the answer was damaged.
    throw new Error("Claude's answer could not be read. Please try again.");
  }
  const answer = importAnswerShape.safeParse(parsedJson);
  if (!answer.success) throw new Error("Claude's answer did not have the expected shape. Please try again.");
  return answer.data.rows;
}
