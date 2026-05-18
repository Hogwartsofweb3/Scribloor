DO $$ BEGIN
 CREATE TYPE "email_status" AS ENUM('sent', 'bounced', 'opened');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "post_status" AS ENUM('draft', 'published', 'scheduled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('reader', 'creator', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "subscription_status" AS ENUM('active', 'expired', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "transaction_status" AS ENUM('pending', 'confirmed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"sent_at" timestamp NOT NULL,
	"opened_at" timestamp,
	"status" "email_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publication_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"cover_image_url" text,
	"content_html" text NOT NULL,
	"preview_html" text,
	"is_paywalled" boolean DEFAULT false NOT NULL,
	"status" "post_status" NOT NULL,
	"scheduled_at" timestamp,
	"published_at" timestamp,
	"email_sent_at" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_pub_slug_unique" UNIQUE("publication_id","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cover_image_url" text,
	"monthly_price_usdc" numeric(12, 6),
	"free_tier_enabled" boolean DEFAULT true NOT NULL,
	"payout_wallet" text NOT NULL,
	"subscriber_count" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "publications_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"publication_id" uuid NOT NULL,
	"subscriber_wallet" text NOT NULL,
	"status" "subscription_status" NOT NULL,
	"started_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_tx_signature" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_sub_pub_unique" UNIQUE("subscriber_id","publication_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"tx_signature" text NOT NULL,
	"amount_usdc" numeric(12, 6) NOT NULL,
	"platform_fee_usdc" numeric(12, 6) NOT NULL,
	"creator_received_usdc" numeric(12, 6) NOT NULL,
	"status" "transaction_status" NOT NULL,
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_tx_signature_unique" UNIQUE("tx_signature")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"privy_id" text NOT NULL,
	"wallet_address" text,
	"email" text,
	"username" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"bio" text,
	"role" "role" DEFAULT 'reader' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_privy_id_unique" UNIQUE("privy_id"),
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_pub_status_pub_at_idx" ON "posts" ("publication_id","status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "publications_slug_idx" ON "publications" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_sub_pub_status_idx" ON "subscriptions" ("subscriber_id","publication_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_wallet_idx" ON "users" ("wallet_address");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_sends" ADD CONSTRAINT "email_sends_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_sends" ADD CONSTRAINT "email_sends_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publications" ADD CONSTRAINT "publications_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriber_id_users_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
