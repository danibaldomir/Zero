CREATE TABLE IF NOT EXISTS "plugin_settings" (
  "plugin_id" text PRIMARY KEY,
  "enabled" boolean NOT NULL DEFAULT true,
  "user_id" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
