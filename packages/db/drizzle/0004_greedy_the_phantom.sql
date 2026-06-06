DO $$ BEGIN
 CREATE TYPE "migration_contact_status" AS ENUM('pending', 'sent', 'opened', 'converted', 'bounced');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "migration_job_status" AS ENUM('pending', 'processing', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "migration_source_platform" AS ENUM('substack', 'beehiiv', 'ghost', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "migration_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"source_subscription_status" text,
	"invite_token" text NOT NULL,
	"invite_sent_at" timestamp,
	"invite_opened_at" timestamp,
	"converted_at" timestamp,
	"status" "migration_contact_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "migration_contacts_invite_token_unique" UNIQUE("invite_token"),
	CONSTRAINT "migration_contacts_job_email_unique" UNIQUE("job_id","email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "migration_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"publication_id" uuid NOT NULL,
	"source_platform" "migration_source_platform" NOT NULL,
	"status" "migration_job_status" DEFAULT 'pending' NOT NULL,
	"total_contacts" integer NOT NULL,
	"emails_sent" integer DEFAULT 0 NOT NULL,
	"emails_opened" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"csv_file_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "migration_contacts_token_idx" ON "migration_contacts" ("invite_token");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "migration_contacts" ADD CONSTRAINT "migration_contacts_job_id_migration_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "migration_jobs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "migration_jobs" ADD CONSTRAINT "migration_jobs_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "migration_jobs" ADD CONSTRAINT "migration_jobs_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
