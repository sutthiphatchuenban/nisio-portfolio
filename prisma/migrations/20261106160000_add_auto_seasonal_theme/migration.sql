ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "auto_seasonal_theme" BOOLEAN NOT NULL DEFAULT false;
