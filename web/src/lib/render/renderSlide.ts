import { getBrowser } from "./browser";
import { buildPostHtml } from "./document";
import { renderInputSchema, type RenderInput } from "./types";

const MIN_FONT_SIZE_PX = 40;

// Runs inside the page: shrinks any text marked data-fit-lines until it fits that many lines.
// A 3-line limit stops a long headline pushing into the footer or off the canvas.
// Keep this function free of inner named functions: it is serialised into the browser, and some
// build tools add helpers (like __name) that do not exist there.
function shrinkTextToFit(minFontSize: number): void {
  const fitTargets = document.querySelectorAll<HTMLElement>("[data-fit-lines]");
  for (const element of Array.from(fitTargets)) {
    const maxLines = Number(element.dataset.fitLines);
    let fontSize = parseFloat(getComputedStyle(element).fontSize);
    while (fontSize > minFontSize) {
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      const lineCount = Math.round(element.getBoundingClientRect().height / lineHeight);
      // scrollWidth check catches a single long word wider than its box.
      const fits = lineCount <= maxLines && element.scrollWidth <= element.clientWidth + 1;
      if (fits) break;
      fontSize -= 2;
      element.style.fontSize = `${fontSize}px`;
    }
  }
}

// THE entry point of the renderer: one slide in, one JPEG out. Everything else in lib/render is a detail,
// so the engine (Playwright today) can be swapped without touching callers (see ADR-009).
export async function renderSlide(rawInput: RenderInput): Promise<Buffer> {
  const input = renderInputSchema.parse(rawInput); // throws a readable zod error if the plan gave us bad data
  const html = await buildPostHtml(input);

  const browser = await getBrowser();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  try {
    // "load" waits for photos from R2 to finish downloading before we take the picture.
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(shrinkTextToFit, MIN_FONT_SIZE_PX);
    return await page.locator(".dp-post").screenshot({ type: "jpeg", quality: 92 });
  } catch (error) {
    // Typical causes: a photo URL that never loads (timeout) or Chromium crashing under memory pressure.
    throw new Error(`Failed to render ${input.template} slide: ${(error as Error).message}`);
  } finally {
    await page.close(); // always free the page, even when rendering failed
  }
}
