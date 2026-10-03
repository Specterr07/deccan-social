# PRD — Deccan Produce Social Pipeline

## Problem

Deccan Produce posts on Instagram and LinkedIn to show it is active and credible: festival greetings, exhibition announcements, informative fruit carousels, fruit days and behind-the-scenes posts. Today one person designs each post by hand in Canva with no brand kit, so the look drifts and the work stops if that person leaves.

## Users

- **Social media person (reviewer)** — uploads the monthly calendar, reviews and approves posts. May change over time; must be able to pick up the system without training.
- **Owner / admin** — signs off the brand, sets the budget, gets the results.
- **Audience** — Instagram followers (warm, curious) and LinkedIn buyers: importers, retailers, distributors (credible, specific).

## Goal

Every month: upload one calendar → receive every planned post rendered on-brand with captions → approve on one page → post. Target: a full month reviewed in under 30 minutes, with most posts approved without edits.

## Inputs

A monthly PDF/document written by the team: dates, festivals and days to mark, exhibitions (name, dates, city, hall/stand), topics for informative posts, any format notes (e.g. "square for this one"). Example: `samples/october-2026-calendar.md`.

## SLC scope (ship tonight)

Simple, Lovable, Complete: a small loop that feels finished.

1. Build the month in the app: a month grid with suggested festival and food days, and an "Add post" panel per day (exhibition details and event logo entered right there). A PDF can still be imported into the grid (ADR-015).
2. Claude plans the month: per post the date, kind, template, fruit palette, aspect (4:5 default), slide text and captions for Instagram and LinkedIn.
3. Each slide gets a picture: a library photo matched by tags first; otherwise **Higgsfield generates artwork** (N variants, default 3) from a brand-styled prompt. Every generation is logged with its cost and stops at the monthly cap.
4. Posts render to 1080 × 1350 JPEGs with the brand templates.
5. An approval email lands with thumbnails and one link.
6. The review page shows the month as a feed. Per post: approve; pick another artwork variant; regenerate artwork; edit on-image text or captions (instant re-render); request changes with a note (Claude rewrites).
7. "Download month pack": zip of images in date folders + `captions.md` + `schedule.csv`.

**Out of SLC:** auto-publishing, scheduled jobs and reminders, LinkedIn API, multi-user roles, brand kit editor, analytics.

## Later (see ARCHITECTURE roadmap)

Phase 2 Instagram auto-publish + reminders · Phase 3 team-ready (roles, brand editor, LinkedIn) · Phase 4 learn from insights.

## Success measures

- October 2026 posts produced and posted from the SLC.
- ≥ 70% of posts approved without edits by month two.
- Image spend ≤ ₹1,500/month.
- A new reviewer completes a month with only the app's own instructions.

## Constraints

- Brand rules in `docs/BRAND.md` are non-negotiable; AI never renders text.
- Budget: ₹2,000/month ceiling for image generation.
- Festival figures/deities only from curated illustrations, never generated.
