import type { RenderInput } from "../types";
import { Canvas, Layer, Photo } from "./Canvas";
import { Footer } from "./Footer";

// Middle slide of a carousel: numbered eyebrow, title, short body, photo card, progress dots. Port of info-carousel-inner.html.
export function InfoCarouselInner({ input }: { input: RenderInput }) {
  const progress = input.progress;

  return (
    <Canvas input={input}>
      <Layer style={{ inset: 0, background: "var(--fruit-tint)" }} />
      <Layer style={{ top: 110, left: 72, right: 72, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 26 }}>
        <div className="dp-eyebrow dp-center">{input.eyebrow}</div>
        <h2 className="dp-title" data-fit-lines="2">{input.hero}</h2>
        <p className="dp-body" data-fit-lines="3" style={{ maxWidth: 860 }}>{input.body}</p>
        <Photo className="dp-photo-card" url={input.photoUrl} style={{ height: 640, marginTop: 10 }} />
        <hr className="dp-rule" style={{ marginTop: 14 }} />
      </Layer>
      {progress && (
        <Layer className="dp-dots" style={{ bottom: 130, left: 0, right: 0, color: "var(--fruit)" }}>
          {Array.from({ length: progress.total }, (_, position) => (
            <i key={position} className={position === progress.index ? "on" : undefined} />
          ))}
        </Layer>
      )}
      <Footer />
    </Canvas>
  );
}
