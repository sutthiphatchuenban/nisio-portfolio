ALTER TABLE "agent_config" ADD COLUMN "instructions" TEXT NOT NULL DEFAULT '';
ALTER TABLE "agent_config" ADD COLUMN "max_steps" INTEGER NOT NULL DEFAULT 6;
