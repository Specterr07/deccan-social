import { createElement } from "react";
import { brandFileAsDataUri, readBrandText } from "./brandFiles";
import { PostTemplate } from "./templates";
import type { RenderInput } from "./types";

let cachedStyles: string | null = null;

// Like String.replace, but the replacement can be async (we need to read files while replacing).
async function replaceAsync(
  text: string,
  pattern: RegExp,
  makeReplacement: (...groups: string[]) => Promise<string>,
): Promise<string> {
  const replacements = await Promise.all([...text.matchAll(pattern)].map((match) => makeReplacement(...match)));
  let nextIndex = 0;
  return text.replace(pattern, () => replacements[nextIndex++]);
}

// Builds the <style> content once: tokens.css (fonts inlined as data URIs) + templates.css.
async function loadStyles(): Promise<string> {
  if (cachedStyles) return cachedStyles;
  const tokensCss = await readBrandText("tokens.css");
  const templatesCss = await readBrandText("templates.css");
  // tokens.css points at fonts like url('./fonts/x.woff'); swap each for the font bytes.
  const tokensWithFonts = await replaceAsync(tokensCss, /url\('\.\/fonts\/([^']+)'\)/g, async (_whole, fileName) => {
    return `url('${await brandFileAsDataUri(`/brand/fonts/${fileName}`)}')`;
  });
  cachedStyles = `${tokensWithFonts}\n${templatesCss}`;
  return cachedStyles;
}

// Turns one slide into a complete, self-contained HTML page (the post at 1080 px wide, nothing else).
export async function buildPostHtml(input: RenderInput): Promise<string> {
  // Next.js refuses to bundle react-dom/server inside app code, but we are not building a page: we need
  // plain HTML text for Chromium. Loading it at run time (outside the bundler) is the supported workaround.
  const { renderToStaticMarkup } = await import(/* turbopackIgnore: true */ "react-dom/server");
  const markup = renderToStaticMarkup(createElement(PostTemplate, { input }));
  // Logos and library photos use "/brand/…" paths in the markup; embed them so Chromium needs no server.
  const markupWithImages = await replaceAsync(markup, /src="(\/brand\/[^"]+)"/g, async (_whole, publicPath) => {
    return `src="${await brandFileAsDataUri(publicPath)}"`;
  });
  const styles = await loadStyles();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${styles}\nbody{margin:0}</style></head><body>${markupWithImages}</body></html>`;
}
