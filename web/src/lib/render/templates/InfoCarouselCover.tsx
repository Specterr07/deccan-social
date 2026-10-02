import { LOGO_COLOR } from "../brandInfo";
import type { RenderInput } from "../types";
import { Canvas, Layer, Photo } from "./Canvas";
import { Footer } from "./Footer";

// First slide of an informative carousel: photo, title, "swipe" pill. Port of info-carousel-cover.html.
export function InfoCarouselCover({ input }: { input: RenderInput }) {
  return (
    <Canvas input={input}>
      <Photo url={input.photoUrl} style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 600, objectFit: "cover" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_COLOR} alt="Deccan Produce" className="dp-logo-sm" style={{ position: "absolute", top: 650, left: 72 }} />
      <Layer style={{ top: 740, left: 72, right: 72, display: "flex", flexDirection: "column", gap: 26 }}>
        <h1 className="dp-hero" data-fit-lines="3">{input.hero}</h1>
        <p className="dp-sub" data-fit-lines="2" style={{ color: "var(--fruit)" }}>{input.sub}</p>
      </Layer>
      <Layer style={{ right: 72, top: 540, background: "var(--fruit-deep)", color: "var(--paper-50)",
        font: "700 24px/1 var(--font-sans)", letterSpacing: 4, padding: "20px 30px", borderRadius: 999 }}>
        SWIPE →
      </Layer>
      <Footer />
    </Canvas>
  );
}
