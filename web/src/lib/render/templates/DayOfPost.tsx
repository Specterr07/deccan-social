import { LOGO_WHITE } from "../brandInfo";
import type { RenderInput } from "../types";
import { Canvas, Layer, Photo } from "./Canvas";
import { Footer } from "./Footer";

// "Happy National Mango Day" style post: photo rising from the bottom under a forest gradient. Port of day-of-post.html.
export function DayOfPost({ input }: { input: RenderInput }) {
  const isSquare = input.aspect === "1:1";
  const photoHeight = isSquare ? 600 : 760;

  return (
    <Canvas input={input}>
      <Layer style={{ inset: 0, background: "var(--forest-900)" }} />
      <Photo url={input.photoUrl} style={{ position: "absolute", bottom: 0, left: 0, width: 1080, height: photoHeight, objectFit: "cover" }} />
      <Layer style={{ bottom: 0, left: 0, width: 1080, height: photoHeight,
        background: "linear-gradient(180deg,var(--forest-900) 0%,var(--scrim-forest) 22%,rgba(15,42,30,0) 55%)" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_WHITE} alt="Deccan Produce" className="dp-logo-sm"
        style={{ position: "absolute", top: 72, left: "50%", transform: "translateX(-50%)" }} />
      <Layer style={{ top: isSquare ? 170 : 200, left: 72, right: 72, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 24, color: "var(--white)" }}>
        <div className="dp-eyebrow dp-center" style={{ color: "var(--fruit-pop, var(--turmeric-500))" }}>{input.eyebrow}</div>
        <h1 className="dp-festival" data-fit-lines="2">{input.hero}</h1>
        <p className="dp-body" data-fit-lines="3" style={{ maxWidth: 780 }}>{input.body}</p>
      </Layer>
      <Footer tone="clear" />
    </Canvas>
  );
}
