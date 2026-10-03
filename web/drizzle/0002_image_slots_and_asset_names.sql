ALTER TABLE "assets" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "storage_key" text;--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "required_image_kind" text;--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "required_image_description" text;--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "required_image_library_name" text;--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "required_image_asset_id" uuid;--> statement-breakpoint
ALTER TABLE "slides" ADD CONSTRAINT "slides_required_image_asset_id_assets_id_fk" FOREIGN KEY ("required_image_asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_name_unique" UNIQUE("name");