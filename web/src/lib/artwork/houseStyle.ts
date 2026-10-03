import { DEITY_WORDS } from "@/schemas/planRules";

// Appended to EVERY artwork prompt (docs/BRAND.md "Imagery and AI artwork"). It keeps text, logos and faces out of the picture:
// AI never draws text (hard rule), all words are placed by the templates.
export const HOUSE_STYLE = "editorial food photography, natural daylight, true-to-life colour, fresh Indian produce, dewy and vibrant, warm earthy surroundings, shallow depth of field, calm empty space for a headline, no text, no letters, no logos, no watermarks, no human faces";

// Refuses scenes we never generate (deities, festival figures). Throws so the slide is left on its fallback picture.
export function buildArtworkPrompt(scene: string): string {
  if (DEITY_WORDS.test(scene)) throw new Error("The artwork scene mentions a deity or festival figure; those are never generated.");
  return `${scene.trim().replace(/[.\s]+$/, "")}. ${HOUSE_STYLE}`;
}

// A plainer prompt for the one retry after a failed or blocked request: just the produce and the house style.
export function buildSoftenedPrompt(photoTags: string[]): string {
  const subject = photoTags.slice(0, 3).join(", ") || "fresh produce";
  return `Close-up of ${subject}, simple composition. ${HOUSE_STYLE}`;
}
