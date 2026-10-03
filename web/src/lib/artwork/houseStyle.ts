import { DEITY_WORDS, TEXT_PRONE_WORDS } from "@/schemas/planRules";

// Appended to EVERY artwork prompt (docs/BRAND.md "Imagery and AI artwork"). AI never draws text (hard rule), so the wording matters:
// T-05 tests showed Soul v2 paints fake magazine typography whenever the prompt says "editorial", "headline" or even "no text".
// What worked: plain "documentary photography" plus one sentence saying the image is an unedited camera photo with no words at all.
export const HOUSE_STYLE = "documentary food photography, natural daylight, true-to-life colour, fresh Indian produce, dewy and vibrant, warm earthy surroundings, shallow depth of field, plenty of empty space at the top of the frame. A clean unedited camera photo: the image contains no words, no letters, no numbers, no captions, no logos and no graphic design at all, and no human faces";

// Refuses scenes we never generate (deities, festival figures) or that make the model invent lettering. Throws so the slide is left on its fallback picture.
export function buildArtworkPrompt(scene: string): string {
  if (DEITY_WORDS.test(scene)) throw new Error("The artwork scene mentions a deity or festival figure; those are never generated.");
  if (TEXT_PRONE_WORDS.test(scene)) throw new Error("The artwork scene mentions boxes, signs, labels or packaging; the image model draws fake lettering on those.");
  return `${scene.trim().replace(/[.\s]+$/, "")}. ${HOUSE_STYLE}`;
}

// A plainer prompt for the one retry after a failed or blocked request: just the produce and the house style.
export function buildSoftenedPrompt(photoTags: string[]): string {
  const subject = photoTags.slice(0, 3).join(", ") || "fresh produce";
  return `Close-up of ${subject}, simple composition. ${HOUSE_STYLE}`;
}
