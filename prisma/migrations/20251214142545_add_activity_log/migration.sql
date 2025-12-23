-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "hasKitchen" BOOLEAN,
ADD COLUMN     "pfListingId" TEXT,
ADD COLUMN     "pfPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pfQualityScore" DOUBLE PRECISION,
ADD COLUMN     "pfSyncedAt" TIMESTAMP(3),
ADD COLUMN     "pfVerificationStatus" TEXT;

-- CreateTable
CREATE TABLE "PropertyFinderLead" (
    "id" TEXT NOT NULL,
    "pfId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comments" TEXT,
    "listingId" TEXT,
    "listingReference" TEXT,
    "assignedToIdentifier" TEXT,
    "dealPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyFinderLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConfig" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "credentials" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyFinderLead_pfId_key" ON "PropertyFinderLead"("pfId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConfig_provider_key" ON "IntegrationConfig"("provider");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
