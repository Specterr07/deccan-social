import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

// `pnpm screenshot <path>[::Button text] …` — logs in, then saves each page at desktop (1440 px) and phone (390 px) width
// into web/.renders/ so we can look at the result before asking anyone to review it. The app must be running (`pnpm dev`).
// "path::Calendar" clicks the tab or button with that name before the picture is taken.
const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const OUTPUT_DIR = path.join(process.cwd(), ".renders");
const SIZES = [{ name: "desktop", width: 1440, height: 1000 }, { name: "phone", width: 390, height: 844 }];

async function main() {
  const targets = process.argv.slice(2);
  const password = process.env.APP_PASSWORD;
  if (targets.length === 0) throw new Error("Give at least one path, for example: pnpm screenshot /months /library");
  if (!password) throw new Error("APP_PASSWORD is missing: run through the package script, which loads .env.local.");
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const size of SIZES) {
      const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
      await page.goto(`${BASE_URL}/login`);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Log in" }).click();
      await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15000 }); // a wrong password stays on /login

      for (const target of targets) {
        const [pagePath, buttonName] = target.split("::");
        await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: "networkidle" });
        if (buttonName) await page.getByRole("tab", { name: buttonName }).or(page.getByRole("button", { name: buttonName })).first().click();
        if (buttonName) await page.waitForTimeout(700); // let dialogs and side panels finish their opening animation
        const fileName = `${pagePath.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}${buttonName ? `-${buttonName.toLowerCase()}` : ""}-${size.name}.png`;
        await page.screenshot({ path: path.join(OUTPUT_DIR, fileName), fullPage: true });
        console.log(`saved .renders/${fileName}`);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error("Screenshot failed:", error.message); process.exit(1); });
