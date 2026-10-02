import { LOGO_WHITE } from "../brandInfo";
import type { RenderInput } from "../types";
import { Canvas, Layer, Photo } from "./Canvas";
import { Footer } from "./Footer";

// "Let's connect at <expo>" post with date boxes, venue and stand. Port of exhibition-post.html.
export function ExhibitionPost({ input }: { input: RenderInput }) {
  const dates = input.dates ?? [];
  // Details are optional: only show what the calendar actually gave us (hard rule: never invent facts).
  const venueLine = [input.venue].filter(Boolean).join("");

  return (
    <Canvas input={input}>
      <Photo url={input.photoUrl} style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 660, objectFit: "cover" }} />
      <Layer className="dp-scrim-top" style={{ height: 660, inset: "0 0 auto 0" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_WHITE} alt="Deccan Produce" className="dp-logo" style={{ position: "absolute", top: 64, left: 72 }} />
      <Layer style={{ top: 660, left: 0, right: 0, bottom: 0, background: "var(--forest-900)" }} />
      {input.eventLogoUrl && (
        <Layer style={{ top: 560, right: 72, width: 330, height: 170, borderRadius: 28, background: "var(--white)",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,.18)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={input.eventLogoUrl} alt="" style={{ maxWidth: 270, maxHeight: 120, objectFit: "contain" }} />
        </Layer>
      )}
      <Layer style={{ top: 770, left: 72, right: 72, display: "flex", flexDirection: "column", gap: 22, color: "var(--white)" }}>
        <div className="dp-eyebrow" style={{ color: "var(--turmeric-500)" }}>{input.eyebrow}</div>
        <h1 className="dp-hero" data-fit-lines="2" style={{ fontSize: 88 }}>{input.hero}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 36, marginTop: 14 }}>
          <div className="dp-dates">
            {dates.map((date) => (
              <div className="dp-date on" key={`${date.day}-${date.month}`}><b>{date.day}</b><span>{date.month}</span></div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {venueLine && <span style={{ font: "700 34px/1 var(--font-sans)" }}>{venueLine}</span>}
            {input.stand && <span style={{ font: "500 26px/1 var(--font-sans)", color: "var(--turmeric-500)" }}>{input.stand}</span>}
          </div>
        </div>
      </Layer>
      <Footer tone="paper" />
    </Canvas>
  );
}
