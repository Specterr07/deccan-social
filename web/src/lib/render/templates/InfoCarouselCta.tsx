import type { RenderInput } from "../types";
import { Canvas, Layer, Photo } from "./Canvas";
import { Footer } from "./Footer";

// Last carousel slide: "work with us" headline, checklist, photo card. Port of info-carousel-cta.html.
export function InfoCarouselCta({ input }: { input: RenderInput }) {
  const checklist = input.checklist ?? [];

  return (
    <Canvas input={input}>
      <Layer style={{ inset: 0, background: "var(--forest-900)" }} />
      <Layer style={{ top: 120, left: 72, right: 72, display: "flex", flexDirection: "column", gap: 34, color: "var(--white)" }}>
        <div className="dp-eyebrow" style={{ color: "var(--turmeric-500)" }}>{input.eyebrow}</div>
        <h2 className="dp-hero" data-fit-lines="3" style={{ fontSize: 80 }}>{input.hero}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, font: "400 32px/1.3 var(--font-sans)" }}>
          {checklist.map((item) => <span key={item}>✓&nbsp; {item}</span>)}
        </div>
        <Photo className="dp-photo-card" url={input.photoUrl} style={{ height: 470, marginTop: 6 }} />
      </Layer>
      <Footer />
    </Canvas>
  );
}
