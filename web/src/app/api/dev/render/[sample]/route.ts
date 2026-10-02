import { renderSamples } from "@/lib/render/samples";
import { renderSlide } from "@/lib/render/renderSlide";

// Dev-only: renders one sample slide to a JPEG so /dev/templates can show it. Disabled in production.
export async function GET(_request: Request, context: { params: Promise<{ sample: string }> }) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });

  const { sample } = await context.params;
  const renderSample = renderSamples[sample];
  if (!renderSample) return new Response(`Unknown sample "${sample}"`, { status: 404 });

  try {
    const jpeg = await renderSlide(renderSample.input);
    return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" } });
  } catch (error) {
    // Show the real reason in dev (missing Chromium, bad photo path…) instead of a blank image.
    console.error(`Dev render of "${sample}" failed:`, error);
    return new Response((error as Error).message, { status: 500 });
  }
}
