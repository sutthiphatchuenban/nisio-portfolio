CREATE TABLE "agent_request" (
  "id" TEXT PRIMARY KEY,
  "owner" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'running',
  "response" JSONB,
  "response_status" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
