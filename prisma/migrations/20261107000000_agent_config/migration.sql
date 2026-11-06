CREATE TABLE "agent_config" (
  "id" TEXT PRIMARY KEY,
  "base_url" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "encrypted_key" TEXT NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
