-- AlterTable
ALTER TABLE "Developer" ADD COLUMN     "pfDeveloperId" TEXT;

-- CreateTable
CREATE TABLE "DeveloperSyncRecord" (
    "id" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperSyncRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperSyncRecord_developerId_resourceType_resourceKey_key" ON "DeveloperSyncRecord"("developerId", "resourceType", "resourceKey");
