CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"kind" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"description" text,
	"people_ok" boolean DEFAULT false NOT NULL,
	"source" text DEFAULT 'upload' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slide_id" uuid,
	"request_id" text,
	"model" text NOT NULL,
	"prompt" text NOT NULL,
	"variant" integer NOT NULL,
	"status" text NOT NULL,
	"cost_usd" numeric(8, 4) DEFAULT '0' NOT NULL,
	"asset_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "months" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" text NOT NULL,
	"calendar_url" text,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"status_message" text,
	"status_updated_at" timestamp DEFAULT now() NOT NULL,
	"reviewer_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "months_month_unique" UNIQUE("month")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month_id" uuid NOT NULL,
	"date" date NOT NULL,
	"time" time,
	"kind" text NOT NULL,
	"template" text NOT NULL,
	"fruit" text DEFAULT 'none' NOT NULL,
	"aspect" text DEFAULT '4:5' NOT NULL,
	"platforms" text[] DEFAULT '{}' NOT NULL,
	"caption_instagram" text,
	"caption_linkedin" text,
	"rationale" text,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"action" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"idx" integer NOT NULL,
	"template_variant" text NOT NULL,
	"eyebrow" text,
	"hero" text,
	"sub" text,
	"info" text,
	"body" text,
	"details" jsonb,
	"checklist" jsonb,
	"photo_tags" text[] DEFAULT '{}' NOT NULL,
	"artwork_prompt" text,
	"asset_id" uuid,
	"render_url" text
);
--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_slide_id_slides_id_fk" FOREIGN KEY ("slide_id") REFERENCES "public"."slides"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_month_id_months_id_fk" FOREIGN KEY ("month_id") REFERENCES "public"."months"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slides" ADD CONSTRAINT "slides_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slides" ADD CONSTRAINT "slides_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;