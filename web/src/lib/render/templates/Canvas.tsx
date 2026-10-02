import type { CSSProperties, ReactNode } from "react";
import type { RenderInput } from "../types";

// The 1080-wide post surface. Adds the fruit palette class and the square modifier (1080 × 1080).
export function Canvas({ input, children }: { input: RenderInput; children: ReactNode }) {
  const classNames = ["dp-post"];
  if (input.fruit !== "none") classNames.push(`dp-fruit-${input.fruit}`);
  if (input.aspect === "1:1") classNames.push("dp-square");
  return <div className={classNames.join(" ")}>{children}</div>;
}

// Shorthand for the absolutely positioned blocks the templates are built from.
export function Layer({ style, children, className }: { style: CSSProperties; children?: ReactNode; className?: string }) {
  return <div className={className} style={{ position: "absolute", ...style }}>{children}</div>;
}

// A photo, or a plain tint block when the slide has no picture yet (so a missing photo never breaks the render).
export function Photo({ url, className, style }: { url?: string; className?: string; style?: CSSProperties }) {
  if (!url) {
    return <div className={className} style={{ background: "var(--fruit-tint)", ...style }} />;
  }
  // eslint-disable-next-line @next/next/no-img-element -- rendered to static HTML for Chromium, not a Next page
  return <img className={className} src={url} alt="" style={style} />;
}
