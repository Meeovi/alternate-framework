ALTER TABLE "users" ADD COLUMN "atproto_did" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "atproto_handle" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_atproto_did_unique" UNIQUE("atproto_did");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_atproto_handle_unique" UNIQUE("atproto_handle");
