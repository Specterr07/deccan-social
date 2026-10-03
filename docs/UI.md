# App UI — how we build the screens

Two different UIs live in this repo. Keep them apart.

| | Post templates (the images) | App UI (the screens people use) |
| --- | --- | --- |
| What | Festival, exhibition, carousel… rendered to JPEG | Login, months, review page, photo library |
| Styling | Plain CSS: `brand/tokens.css` + `brand/templates.css` (`dp-*` classes) | Tailwind CSS v4 + shadcn/ui, themed from brand tokens |
| Rule | Never use Tailwind or shadcn inside a template | Never use `dp-*` classes in app screens |

## Stack (decided in ADR-008)

- **shadcn/ui** — components are copied into `web/src/components/ui/` and owned by us (built on Radix primitives: accessible dialogs, tabs, menus). Add only what a screen needs: `npx shadcn@latest add button`.
- **Tailwind CSS v4** — CSS-first config in `web/src/app/globals.css` (`@theme`), no `tailwind.config` file.
- **lucide-react** icons (shadcn default). **sonner** for toasts.
- Forms: server actions + zod. No form library unless a form gets complex.
- Verify current install steps for Next 16 + Tailwind v4 against ui.shadcn.com before running them; record anything surprising in the task Notes.

## Theme: brand tokens → shadcn variables

Map shadcn's CSS variables to brand tokens in `globals.css`; never hardcode hex in components.

| shadcn variable | Brand value | Note |
| --- | --- | --- |
| `--background` | `paper-50` #FAF5EA | App background |
| `--foreground` | `ink-900` #16211B | Body text |
| `--card` / `--popover` | #FFFFFF | Cards sit white on paper |
| `--primary` / `--primary-foreground` | `leaf-700` #005F37 / #FFFFFF | Main actions (Approve, Upload) |
| `--secondary`, `--muted`, `--accent` | `paper-100` #EFE6D2 | Quiet buttons, hovers, panels |
| `--muted-foreground` | `ink-600` #4A5650 | Helper text |
| `--destructive` | `pomegranate-700` #9E1B2F | Delete, request changes |
| `--border`, `--input` | #E2D8C3 | Hairlines on paper |
| `--ring` | `leaf-700` | Focus ring, always visible |
| `--radius` | 12px (`radius-sm`) | |

Fonts: load `brand/fonts/*` with `next/font/local`. Page titles in Fraunces 600; everything else League Spartan (400/500/700). Light theme only for the SLC.

## Screens and the components they use

| Screen | Key components |
| --- | --- |
| Login | Card, Input, Button |
| Month planner (`/months/[id]`, while drafting; "Calendar" tab after) | 7-column grid of entry chips (type label + colour), Sheet "Add post" with per-type fields, Dialog "Plan N posts", side Cards "This month" and "Suggested days". Mockup: https://claude.ai/artifact/1uGkPpWimDRdhuMcZjawqW |
| Months list (`/months`) | Table or Card list, Badge (status), Button "Upload calendar" + Dialog with file input |
| Month review (`/months/[id]`) | Feed grid of Cards; post card = slide carousel (rendered JPEGs), Tabs (Instagram / LinkedIn caption), Badge status, Buttons (Approve, Edit, Request changes), Dialog/Sheet for edits, Textarea, spend meter, progress banner |
| Photo library (`/library`) | Upload Dialog (multi-file input), Input tags, Checkbox "people OK to post", image grid, Select filters |
| Dev templates (`/dev/templates`) | Shows rendered JPEGs only |

## Rules

- **Show posts as rendered JPEGs** (or an `<iframe>` of the standalone template HTML) — never render template markup inside the app's DOM, so Tailwind's reset can't change how a post looks.
- Every status has a word, not only a colour: Draft · Rendering · Ready for review · Changes requested · Approved.
- Mobile-friendly review page: the social media person may approve from a phone (single column under 640px).
- Plain copy for a non-technical reviewer: "Approve post", "Try another picture", "Ask for changes".
- Every button that spends money (regenerate artwork) shows the cost and remaining budget.
