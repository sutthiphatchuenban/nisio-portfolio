CREATE TABLE "agent_session" (
  "id" TEXT PRIMARY KEY,
  "owner" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'แชตใหม่',
  "messages" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "active_request" TEXT,
  "locked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "agent_session_owner_updated_at_idx" ON "agent_session" ("owner", "updated_at" DESC);
INSERT INTO "agent_session" ("id", "owner", "title", "messages", "created_at", "updated_at")
SELECT gen_random_uuid()::text, "owner", 'บทสนทนาเดิม', "messages", "updated_at", "updated_at"
FROM "agent_history" WHERE jsonb_array_length("messages") > 0;
ALTER TABLE "agent_request" ADD COLUMN "session_id" TEXT;
