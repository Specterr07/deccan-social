CREATE TABLE "calendar_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month_id" uuid NOT NULL,
	"date" date NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"details" jsonb,
	"notes" text,
	"aspect" text DEFAULT '4:5' NOT NULL,
	"time" time,
	"platforms" text[] DEFAULT '{"instagram","linkedin"}' NOT NULL,
	"required_image_asset_id" uuid,
	"source" text DEFAULT 'manual' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "months" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "entry_id" uuid;--> statement-breakpoint
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_month_id_months_id_fk" FOREIGN KEY ("month_id") REFERENCES "public"."months"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_required_image_asset_id_assets_id_fk" FOREIGN KEY ("required_image_asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_entry_id_calendar_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."calendar_entries"("id") ON DELETE set null ON UPDATE no action;