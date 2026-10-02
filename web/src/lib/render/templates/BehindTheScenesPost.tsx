import { FOOTER_EMAIL, LOGO_COLOR } from "../brandInfo";
import type { RenderInput } from "../types";
import { Canvas, Layer, Photo } from "./Canvas";
import { Footer } from "./Footer";

// Full-bleed photo with a headline on top and a logo footer. Port of behind-the-scenes-post.html.
export function BehindTheScenesPost({ input }: { input: RenderInput }) {
  return (
    <Canvas input={input}>
      <Photo className="dp-photo" url={input.photoUrl} style={{ height: 1254 }} />
      <Layer className="dp-scrim-top" style={{ height: 1254, inset: "0 0 auto 0" }} />
      <Layer style={{ top: 84, left: 72, right: 200, display: "flex", flexDirection: "column", gap: 22, color: "var(--white)" }}>
        <div className="dp-eyebrow" style={{ color: "var(--turmeric-500)" }}>{input.eyebrow}</div>
        <h1 className="dp-hero" data-fit-lines="3" style={{ fontSize: 84 }}>{input.hero}</h1>
      </Layer>
      <Footer tone="paper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_COLOR} alt="Deccan Produce" style={{ height: 46 }} />
        <span>{FOOTER_EMAIL}</span>
      </Footer>
    </Canvas>
  );
}
