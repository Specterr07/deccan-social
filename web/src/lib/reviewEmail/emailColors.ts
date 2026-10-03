import { readBrandText } from "@/lib/render/brandFiles";

// Email clients cannot use CSS variables, so the few colours the email needs are read from brand/tokens.css
// (the single source of truth) instead of being typed into code.
export type EmailColors = { paper: string; paperDark: string; ink: string; inkSoft: string; green: string; alert: string; white: string };

const TOKEN_NAMES: Record<keyof EmailColors, string> = {
  paper: "paper-50", paperDark: "paper-100", ink: "ink-900", inkSoft: "ink-600", green: "leaf-700", alert: "pomegranate-700", white: "white",
};

export async function readEmailColors(): Promise<EmailColors> {
  const css = await readBrandText("tokens.css");
  const colors = {} as EmailColors;
  for (const [key, token] of Object.entries(TOKEN_NAMES) as [keyof EmailColors, string][]) {
    const match = css.match(new RegExp(`--${token}:\\s*(#[0-9a-fA-F]{3,8})`));
    if (!match) throw new Error(`The brand colour --${token} is missing from brand/tokens.css, so the email cannot be styled.`);
    colors[key] = match[1];
  }
  return colors;
}
