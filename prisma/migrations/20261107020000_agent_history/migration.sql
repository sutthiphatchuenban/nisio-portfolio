CREATE TABLE "agent_history" (
  "owner" TEXT PRIMARY KEY,
  "messages" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
