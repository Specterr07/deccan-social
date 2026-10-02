# Brand — design language

Full visual reference: `brand/templates/*.png` (target renders) and the online brand kit https://claude.ai/artifact/37MQ2N2hKM9QhDwx3EQiVt. Values live in `brand/tokens.json` → generated `brand/tokens.css`; layout classes in `brand/templates.css`. Approved by Vivek on 2026-10-01.

## The post

- Canvas 1080 × 1350 (4:5). `dp-square` = 1080 × 1080 when the calendar asks.
- Text and logo inside `--safe-margin` (72px). Footer strip on every post (`--footer-height` 96px).
- One hero, at most one sub, at most one info line per slide.

## Voice

Rooted, trustworthy, quietly proud of Indian farms; festive without shouting. "We" = Deccan Produce; "our partners, growers and families".

- Lead with the fruit, season or people — never with selling.
- Informative carousels: slide 1 hooks (a question or claim), inner slides one idea each (≤ 35 words), last slide closes with an enquiry invite.
- Festivals: thank customers, partners and associates; tie to harvest/abundance; at most one regional word.
- Exhibitions: "Let's connect at …" + exact dates, city, hall/stand from the calendar only.
- Sentence case; UPPERCASE only for eyebrows and festival names. No emoji on images (captions may use a few). No hard sell, no strong health claims.
- Instagram caption: warm, 2–4 short paragraphs, light emoji, 5–10 hashtags. LinkedIn caption: B2B, export quality / sourcing / supply, 3–5 hashtags.

Tone references: "Let's connect!", "The finest of produce from India", "Peak harvest. Superior quality. Global export readiness."

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| `leaf-700` | #005F37 | Brand green (from the logo); headlines on paper |
| `forest-900` | #0F2A1E | Dark ground |
| `olive-500` | #6E8B3D | "Produce" in the wordmark; large text only |
| `paper-50` | #FAF5EA | Default ground (never pure white) |
| `paper-100` | #EFE6D2 | Paper footer, panels |
| `ink-900` / `ink-600` | #16211B / #4A5650 | Text / muted text |
| `turmeric-500` | #E3A21A | Festive accent; never text on paper |

One fruit palette per post via class: `dp-fruit-pomegranate`, `dp-fruit-mango`, `dp-fruit-grape`, `dp-fruit-citrus` (sets `--fruit`, `--fruit-deep`, `--fruit-tint`). No class = brand greens.

## Type

Fraunces (display serif): `hero` 96, `hero-italic` 72, `title` 64. League Spartan (geometric sans, the wordmark face): `festival` 120 uppercase, `eyebrow` 26 tracked uppercase, `sub` 38, `body` 32, `info` 26, `footer` 26. Never a third family; never below 26px on the canvas.

## Logo

`brand/logos/`: `wordmark-color.svg` (paper/white grounds), `wordmark-white.svg` (dark grounds and photos with scrim), `wordmark-leaf.svg` (one green), `d-mark-*.svg` (mark alone). Height 52–80px. Clear space = height of the D. Never retype or recolour.

## Templates

| Template | When | Files |
| --- | --- | --- |
| Festival | Indian festivals, national days | `festival-post.*` |
| Exhibition | Trade fairs (event logo supplied, never redrawn) | `exhibition-post.*` |
| Info carousel | 3–6 slide stories: cover / inner / CTA | `info-carousel-*.*` |
| Day-of | World/national fruit days | `day-of-post.*` |
| Behind the scenes | Real library photos of people/places | `behind-the-scenes-post.*` |

## Imagery and AI artwork

Library photos first. AI artwork (Higgsfield) only when the library has nothing, and every prompt ends with the house style:

> editorial food photography, natural daylight, true-to-life colour, fresh Indian produce, dewy and vibrant, warm earthy surroundings, shallow depth of field, calm empty space for a headline, no text, no letters, no logos, no watermarks, no human faces

Never generate deities or festival figures (use the curated illustration library, always reviewed). Photos with people need the "people OK to post" flag.
