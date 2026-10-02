import { chromium, type Browser } from "playwright";

// One Chromium for the whole server process: launching takes ~1s, rendering a slide ~0.3s.
const globalForBrowser = globalThis as unknown as { browserPromise?: Promise<Browser> };

// Returns the shared browser, launching it on first use and again if it has crashed or been closed.
export async function getBrowser(): Promise<Browser> {
  const existing = globalForBrowser.browserPromise;
  if (existing) {
    const browser = await existing.catch(() => null);
    if (browser?.isConnected()) return browser;
  }
  // Chromium can fail to start if it is not installed (run `pnpm exec playwright install chromium`)
  // or the container lacks its system libraries (the Playwright base image has them).
  globalForBrowser.browserPromise = chromium.launch({ args: ["--font-render-hinting=none"] });
  return globalForBrowser.browserPromise;
}
