ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN "image" text;
ALTER TABLE "users" DROP COLUMN "avatar_url";
