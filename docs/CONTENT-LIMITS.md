# Content limits — how much text fits on a post

Every post is a fixed 1080 px canvas, so text has to be short. These limits come from measuring the real templates (`brand/templates.css`, 72 px safe margin, fonts at the sizes in `docs/BRAND.md`). They are enforced in code in **`web/src/schemas/limits.ts`** (the planner's zod schema). **If you change a number there, change it here too** — and the other way round.

Counts are characters including spaces, unless stated. The renderer shrinks a headline that runs a little long (down to a 40 px floor), but anything beyond these limits looks cramped, so the planner is told to stay within them and the app rejects a plan that does not.

## On-image text

| Field | Where it appears | Max | Why |
| --- | --- | --- | --- |
| `eyebrow` | Small tracked-caps line above the headline | **32** | One line at 26 px with 4.5 px letter spacing. Centred eyebrows also carry a line on each side, so they have less room. Shown in UPPERCASE by the template — write in sentence case. |
| `hero` — festival / day-of | Festival or day name (120 px, uppercase) | **18** | Two lines at most. "Mango Day", "Independence Day", "World Food Day" all fit. |
| `hero` — exhibition | Event name (88 px) | **45** | Two lines at most. |
| `hero` — behind the scenes | Headline over the photo (84 px) | **60** | Three lines at most; the right 200 px is kept clear. |
| `hero` — carousel cover | Hook (96 px) | **60** | Three lines at most. A question or a claim. |
| `hero` — carousel inner | Slide title (64 px) | **40** | Two lines at most. One idea per slide. |
| `hero` — carousel closing slide | Enquiry headline (80 px) | **55** | Three lines at most. |
| `sub` | Line under the cover headline (38 px) | **60** | One line is best; two at most. |
| `body` — festival / day-of | Greeting under the name (32 px) | **120** | Two to three lines, 760 px wide. |
| `body` — carousel inner | Explanation (32 px) | **160** and **35 words** | Three lines at most. The 35-word rule is from the brand voice. |
| `checklist` (closing slide) | Tick-list lines (32 px) | **2–4 items, 40 each** | Three items is the sweet spot; each must stay on one line. |
| `venue` (exhibition) | City / venue next to the dates (34 px) | **28** | Beside the date boxes. |
| `stand` (exhibition) | Hall / stand line (26 px) | **28** | Same row. |
| `dates` (exhibition) | One box per day | **1–4 boxes** | Four boxes use half the width. For an event longer than four days, show the first and last day only and give the full range in the caption. |

| `required_image.description` | Label of the upload box on the month page ("Upload <description>") | **60** | One short line, e.g. "Event logo for World Fresh Produce Expo". |
| `required_image.library_name` | Name of an existing library image written in the calendar | **60** | Lower-case words and hyphens, copied from the calendar, never invented. |

Required images (see ADR-014): exhibition slides always have an **event logo**; behind-the-scenes slides always have a **specific photo**; a calendar row can ask for one on any other slide. They are filled only by an upload, a library pick, or a library name written in the calendar — never by AI or a tag guess. Until filled, the post is `needs_image` and cannot be approved.

Rules that are not about length:
- One hero, at most one sub, at most one info line per slide (brand rule).
- Facts (dates, city, hall, stand, event name) are copied from the calendar. If the calendar does not give one, **leave the field out** — the template simply omits it. Never guess.
- Sentence case everywhere except eyebrows and festival names (the template uppercases those). No emoji on images.

## Posts and carousels

| Item | Limit |
| --- | --- |
| Single-image posts (festival, day-of, exhibition, behind the scenes) | exactly **1 slide** |
| Informative carousel | **3–6 slides**: slide 1 cover, middle slides inner, last slide closing with an enquiry invite |
| Posts per month | up to **31** (the planner is asked for a sensible mix, usually 6–12) |
| Post time | `HH:MM` in IST; defaults to **10:00** unless the calendar says otherwise |
| Aspect | `4:5` by default; `1:1` only when the calendar asks (festival and day-of support it) |

## Captions and notes

| Field | Limit | Notes |
| --- | --- | --- |
| Instagram caption | **300–900** chars | 2–4 short paragraphs, light emoji, **5–10 hashtags** at the end. (Instagram's own limit is 2,200.) |
| LinkedIn caption | **300–1,200** chars | B2B tone: quality, sourcing, supply; **3–5 hashtags**. (LinkedIn's own limit is 3,000.) |
| `rationale` | **200** chars | One sentence for the reviewer: why this post, why this template. |
| `photo_tags` | **1–6** tags | Lower-case words used to find a library photo (e.g. `pomegranate`, `orchard`). |
| `artwork_prompt` | **280** chars | Describes the scene only. The app appends the brand house style. It must not ask for text, logos, faces, deities or festival figures. |

## When something is too long

1. The planner prompt states these limits, so Claude should stay inside them.
2. If the plan still breaks a limit, the app sends the problems back to Claude once and asks for a corrected plan.
3. If it is still wrong, the month shows a readable error ("Post 3 (Dussehra): hero is 24 characters, the limit is 18") and nothing is saved.
4. When a person edits text on the review page, the same limits apply and the form shows what is left.
