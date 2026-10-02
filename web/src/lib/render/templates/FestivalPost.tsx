import { LOGO_COLOR } from "../brandInfo";
import type { RenderInput } from "../types";
import { Canvas, Layer, Photo } from "./Canvas";
import { Footer } from "./Footer";

// Festival greeting: turmeric double frame, arch photo, big festival name. Port of festival-post.html.
export function FestivalPost({ input }: { input: RenderInput }) {
  const isSquare = input.aspect === "1:1";
  // Square posts are 270px shorter, so the photo shrinks and the text block moves up.
  const photoBox = isSquare
    ? { top: 150, left: 290, width: 500, height: 360, borderRadius: "250px 250px 28px 28px" }
    : { top: 170, left: 210, width: 660, height: 580, borderRadius: "330px 330px 28px 28px" };
  const textTop = isSquare ? 545 : 800;

  return (
    <Canvas input={input}>
      <Layer style={{ inset: "36px 36px 132px 36px", border: "4px solid var(--turmeric-500)", borderRadius: 28 }} />
      <Layer style={{ inset: "52px 52px 148px 52px", border: "2px solid var(--turmeric-500)", borderRadius: 18, opacity: 0.55 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_COLOR} alt="Deccan Produce" className="dp-logo-sm"
        style={{ position: "absolute", top: isSquare ? 76 : 84, left: "50%", transform: "translateX(-50%)", height: 50 }} />
      <Photo url={input.photoUrl} style={{ position: "absolute", objectFit: "cover", border: "8px solid var(--white)", ...photoBox }} />
      <Layer style={{ top: textTop, left: 110, right: 110, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: isSquare ? 18 : 22 }}>
        <div className="dp-eyebrow dp-center" style={{ color: "var(--pomegranate-700)" }}>{input.eyebrow}</div>
        <h1 className="dp-festival" data-fit-lines="2" style={{ color: "var(--leaf-700)" }}>{input.hero}</h1>
        <p className="dp-body" data-fit-lines="3" style={{ color: "var(--ink-900)", maxWidth: 760 }}>{input.body}</p>
      </Layer>
      <Footer />
    </Canvas>
  );
}
