import { notFound } from "next/navigation";
import { renderSamples } from "@/lib/render/samples";

// Dev-only gallery: each template rendered by the real renderer, next to its brand reference image.
export default function DevTemplatesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Template renders</h1>
        <p className="text-sm text-muted-foreground">Left: rendered by the app. Right: the approved reference from brand/templates.</p>
      </div>
      {Object.entries(renderSamples).map(([key, sample]) => (
        <section key={key} className="space-y-2">
          <h2 className="text-xl">{sample.label}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Plain <img>: these are generated JPEGs, shown exactly as posted (no Next image optimiser). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/dev/render/${key}`} alt={`${sample.label} render`} className="w-full rounded border" />
            {sample.reference && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/brand/templates/${sample.reference}`} alt={`${sample.label} reference`} className="w-full rounded border" />
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
