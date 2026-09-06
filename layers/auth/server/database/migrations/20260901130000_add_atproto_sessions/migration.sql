CREATE TABLE "atproto_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"did" varchar(255) NOT NULL,
	"handle" varchar(255) NOT NULL,
	"service" varchar(255) NOT NULL,
	"access_jwt" text NOT NULL,
	"refresh_jwt" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "atproto_sessions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "atproto_sessions_did_unique" UNIQUE("did")
);
--> statement-breakpoint
ALTER TABLE "atproto_sessions" ADD CONSTRAINT "atproto_sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "atproto_sessions" ENABLE ROW LEVEL SECURITY;
