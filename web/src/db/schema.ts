import { relations } from "drizzle-orm";
import {
  boolean, integer, jsonb, numeric, pgTable, text, timestamp, uuid, date, time,
} from "drizzle-orm/pg-core";

// Table layout follows docs/ARCHITECTURE.md "Data model". Enum-like columns are plain text,
// validated with zod at the boundary, so adding a value later needs no migration.

export const months = pgTable("months", {
  id: uuid("id").primaryKey().defaultRandom(),
  month: text("month").notNull().unique(), // "YYYY-MM"
  calendarUrl: text("calendar_url"),
  status: text("status").notNull().default("uploaded"),
  statusMessage: text("status_message"), // readable error or progress note shown on the month page
  reviewerEmail: text("reviewer_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  monthId: uuid("month_id").notNull().references(() => months.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  time: time("time"),
  kind: text("kind").notNull(), // festival | exhibition | informative | day_of | bts
  template: text("template").notNull(),
  fruit: text("fruit").notNull().default("none"), // pomegranate | mango | grape | citrus | none
  aspect: text("aspect").notNull().default("4:5"), // 4:5 | 1:1
  platforms: text("platforms").array().notNull().default([]),
  captionInstagram: text("caption_instagram"),
  captionLinkedin: text("caption_linkedin"),
  rationale: text("rationale"),
  status: text("status").notNull().default("draft"),
});

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  kind: text("kind").notNull(), // photo | cutout | event_logo | illustration | ai
  tags: text("tags").array().notNull().default([]),
  description: text("description"),
  peopleOk: boolean("people_ok").notNull().default(false),
  source: text("source").notNull().default("upload"), // upload | higgsfield
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const slides = pgTable("slides", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  idx: integer("idx").notNull(),
  templateVariant: text("template_variant").notNull(), // cover | inner | cta | single
  eyebrow: text("eyebrow"),
  hero: text("hero"),
  sub: text("sub"),
  info: text("info"),
  body: text("body"),
  details: jsonb("details"),
  checklist: jsonb("checklist"),
  photoTags: text("photo_tags").array().notNull().default([]),
  artworkPrompt: text("artwork_prompt"),
  assetId: uuid("asset_id").references(() => assets.id, { onDelete: "set null" }),
  renderUrl: text("render_url"),
});

export const generations = pgTable("generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  slideId: uuid("slide_id").references(() => slides.id, { onDelete: "set null" }),
  requestId: text("request_id"),
  model: text("model").notNull(),
  prompt: text("prompt").notNull(),
  variant: integer("variant").notNull(),
  status: text("status").notNull(),
  costUsd: numeric("cost_usd", { precision: 8, scale: 4 }).notNull().default("0"),
  assetId: uuid("asset_id").references(() => assets.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // approve | request_changes | edit
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const monthsRelations = relations(months, ({ many }) => ({ posts: many(posts) }));
export const postsRelations = relations(posts, ({ one, many }) => ({
  month: one(months, { fields: [posts.monthId], references: [months.id] }),
  slides: many(slides),
  reviews: many(reviews),
}));
export const slidesRelations = relations(slides, ({ one, many }) => ({
  post: one(posts, { fields: [slides.postId], references: [posts.id] }),
  asset: one(assets, { fields: [slides.assetId], references: [assets.id] }),
  generations: many(generations),
}));
