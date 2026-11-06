ALTER TABLE "agent_config" ADD COLUMN "model_options" JSONB NOT NULL DEFAULT '{}'::jsonb;
