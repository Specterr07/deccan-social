# brand/

Source of truth for every visual. App code imports from here; never copy values into components.

| Path | What |
| --- | --- |
| `tokens.json` | Design tokens (colours, type scale, spacing, radius). Edit this. |
| `tokens.css` | GENERATED from tokens.json (CSS variables + @font-face). Regenerate when tokens change. |
| `templates.css` | Post layout classes (`dp-post`, `dp-hero`, `dp-footer`, fruit palettes …) |
| `templates/*.html` | Standalone reference HTML for each template — open in a browser |
| `templates/*.png` | Reference renders at 1080 × 1350 — the target look |
| `logos/` | Wordmark and D-mark SVGs (traced from `d-mark-original.png`) |
| `fonts/` | Fraunces and League Spartan (OFL) woff files |
| `sample-photos/` | Photos cropped from past posts — seed the library with these |
| `reference-posts/` | 12 published posts the kit was distilled from (tone reference only) |

Online, browsable version: https://claude.ai/artifact/37MQ2N2hKM9QhDwx3EQiVt
