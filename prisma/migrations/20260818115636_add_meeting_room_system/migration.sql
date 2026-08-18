-- CreateTable
CREATE TABLE "meeting_rooms" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "passcode" VARCHAR(255),
    "host_name" VARCHAR(255) NOT NULL,
    "host_avatar" TEXT,
    "host_color" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_participants" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "avatar" TEXT,
    "color" VARCHAR(50),
    "is_host" BOOLEAN NOT NULL DEFAULT false,
    "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_messages" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "sender_name" VARCHAR(255) NOT NULL,
    "sender_color" VARCHAR(50),
    "sender_avatar" TEXT,
    "is_host" BOOLEAN NOT NULL DEFAULT false,
    "type" VARCHAR(50) NOT NULL DEFAULT 'text',
    "content" TEXT NOT NULL,
    "file_url" TEXT,
    "file_name" VARCHAR(255),
    "file_size" INTEGER,
    "file_type" VARCHAR(100),
    "reactions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meeting_rooms_code_key" ON "meeting_rooms"("code");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_participants_room_id_name_key" ON "meeting_participants"("room_id", "name");

-- CreateIndex
CREATE INDEX "meeting_messages_room_id_created_at_idx" ON "meeting_messages"("room_id", "created_at");

-- AddForeignKey
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "meeting_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_messages" ADD CONSTRAINT "meeting_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "meeting_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
