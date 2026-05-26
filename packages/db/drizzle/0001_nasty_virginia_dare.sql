DO $$ BEGIN
 CREATE TYPE "vault_access_type" AS ENUM('single_purchase', 'vault_pass');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "vault_category" AS ENUM('research', 'report', 'analysis', 'guide', 'data', 'essay');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "vault_entry_status" AS ENUM('draft', 'pending_review', 'published', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "vault_pass_status" AS ENUM('pending', 'active', 'expired', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "vault_revenue_status" AS ENUM('pending', 'paid');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "subscription_status" ADD VALUE 'pending';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "landing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"country" text,
	"metadata" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vault_access_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"access_type" "vault_access_type" NOT NULL,
	"tx_signature" text,
	"amount_paid_usdc" numeric(12, 6),
	"accessed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vault_access_records_tx_signature_unique" UNIQUE("tx_signature"),
	CONSTRAINT "vault_access_records_entry_user_unique" UNIQUE("entry_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vault_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"abstract" text NOT NULL,
	"cover_image_url" text,
	"content_html" text NOT NULL,
	"category" "vault_category" NOT NULL,
	"tags" text[],
	"single_access_price_usdc" numeric(12, 6),
	"is_vault_pass_included" boolean DEFAULT true NOT NULL,
	"word_count" integer NOT NULL,
	"read_time_minutes" integer NOT NULL,
	"access_count" integer DEFAULT 0 NOT NULL,
	"status" "vault_entry_status" NOT NULL,
	"rejection_reason" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vault_entries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vault_pass_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"status" "vault_pass_status" NOT NULL,
	"started_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_tx_signature" text,
	"monthly_price_usdc" numeric(12, 6) DEFAULT '5.00' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vault_revenue_distributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"access_count" integer NOT NULL,
	"total_pool_usdc" numeric(12, 6) NOT NULL,
	"author_share_usdc" numeric(12, 6) NOT NULL,
	"distribution_tx_signature" text,
	"status" "vault_revenue_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "nft_gate_collection" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "nft_gate_name" text;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "nft_gate_collection" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vault_access_records" ADD CONSTRAINT "vault_access_records_entry_id_vault_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "vault_entries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vault_access_records" ADD CONSTRAINT "vault_access_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vault_entries" ADD CONSTRAINT "vault_entries_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vault_pass_subscriptions" ADD CONSTRAINT "vault_pass_subscriptions_subscriber_id_users_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vault_revenue_distributions" ADD CONSTRAINT "vault_revenue_distributions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
