-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('EMAIL', 'PHONE', 'INSTAGRAM', 'WHATSAPP', 'TELEGRAM', 'X', 'LINKEDIN', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SocialType" AS ENUM ('INSTAGRAM', 'X', 'LINKEDIN', 'FACEBOOK', 'TIKTOK', 'YOUTUBE', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AttachmentType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'LINK');

-- CreateEnum
CREATE TYPE "public"."ReminderStatus" AS ENUM ('PENDING', 'DONE', 'SNOOZED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."SourceType" AS ENUM ('MANUAL', 'IMPORT', 'SYNC');

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Person" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "phonetic" TEXT,
    "notes" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonTag" (
    "personId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PersonTag_pkey" PRIMARY KEY ("personId","tagId")
);

-- CreateTable
CREATE TABLE "public"."Group" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonGroup" (
    "personId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "PersonGroup_pkey" PRIMARY KEY ("personId","groupId")
);

-- CreateTable
CREATE TABLE "public"."Encounter" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "happenedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "note" TEXT,
    "source" "public"."SourceType" NOT NULL DEFAULT 'MANUAL',
    "locationText" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "placeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContactMethod" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" "public"."ContactType" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialProfile" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" "public"."SocialType" NOT NULL,
    "handle" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonAttachment" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" "public"."AttachmentType" NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EncounterAttachment" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "type" "public"."AttachmentType" NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncounterAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reminder" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "personId" TEXT,
    "encounterId" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventLog" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "public"."UserProfile"("email");

-- CreateIndex
CREATE INDEX "Person_userId_idx" ON "public"."Person"("userId");

-- CreateIndex
CREATE INDEX "Person_name_idx" ON "public"."Person"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Person_userId_name_nickname_key" ON "public"."Person"("userId", "name", "nickname");

-- CreateIndex
CREATE INDEX "Tag_userId_name_idx" ON "public"."Tag"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "public"."Tag"("userId", "name");

-- CreateIndex
CREATE INDEX "PersonTag_tagId_idx" ON "public"."PersonTag"("tagId");

-- CreateIndex
CREATE INDEX "Group_userId_name_idx" ON "public"."Group"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Group_userId_name_key" ON "public"."Group"("userId", "name");

-- CreateIndex
CREATE INDEX "PersonGroup_groupId_idx" ON "public"."PersonGroup"("groupId");

-- CreateIndex
CREATE INDEX "Encounter_personId_happenedAt_idx" ON "public"."Encounter"("personId", "happenedAt");

-- CreateIndex
CREATE INDEX "Encounter_createdById_idx" ON "public"."Encounter"("createdById");

-- CreateIndex
CREATE INDEX "Encounter_happenedAt_idx" ON "public"."Encounter"("happenedAt");

-- CreateIndex
CREATE INDEX "ContactMethod_personId_type_idx" ON "public"."ContactMethod"("personId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ContactMethod_personId_type_value_key" ON "public"."ContactMethod"("personId", "type", "value");

-- CreateIndex
CREATE INDEX "SocialProfile_personId_type_idx" ON "public"."SocialProfile"("personId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "SocialProfile_personId_type_handle_key" ON "public"."SocialProfile"("personId", "type", "handle");

-- CreateIndex
CREATE INDEX "PersonAttachment_personId_type_idx" ON "public"."PersonAttachment"("personId", "type");

-- CreateIndex
CREATE INDEX "EncounterAttachment_encounterId_type_idx" ON "public"."EncounterAttachment"("encounterId", "type");

-- CreateIndex
CREATE INDEX "Reminder_userId_dueAt_idx" ON "public"."Reminder"("userId", "dueAt");

-- CreateIndex
CREATE INDEX "Reminder_personId_idx" ON "public"."Reminder"("personId");

-- CreateIndex
CREATE INDEX "Reminder_encounterId_idx" ON "public"."Reminder"("encounterId");

-- CreateIndex
CREATE INDEX "EventLog_userId_entity_entityId_idx" ON "public"."EventLog"("userId", "entity", "entityId");

-- AddForeignKey
ALTER TABLE "public"."Person" ADD CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonTag" ADD CONSTRAINT "PersonTag_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonTag" ADD CONSTRAINT "PersonTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Group" ADD CONSTRAINT "Group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonGroup" ADD CONSTRAINT "PersonGroup_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonGroup" ADD CONSTRAINT "PersonGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Encounter" ADD CONSTRAINT "Encounter_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Encounter" ADD CONSTRAINT "Encounter_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactMethod" ADD CONSTRAINT "ContactMethod_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialProfile" ADD CONSTRAINT "SocialProfile_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonAttachment" ADD CONSTRAINT "PersonAttachment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EncounterAttachment" ADD CONSTRAINT "EncounterAttachment_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "public"."Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reminder" ADD CONSTRAINT "Reminder_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reminder" ADD CONSTRAINT "Reminder_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "public"."Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
