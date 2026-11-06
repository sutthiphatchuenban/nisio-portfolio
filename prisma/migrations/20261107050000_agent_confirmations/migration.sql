CREATE TABLE "agent_confirmation" (
  "id" TEXT PRIMARY KEY,
  "owner" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "target_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
