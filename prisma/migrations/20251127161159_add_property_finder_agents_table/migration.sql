-- CreateTable
CREATE TABLE "property_finder_agents" (
    "id" TEXT NOT NULL,
    "pfUserId" TEXT NOT NULL,
    "pfPublicProfileId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "photoUrl" TEXT,
    "position" TEXT,
    "roleName" TEXT,
    "roleKey" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "whatsapp" TEXT,
    "languages" TEXT[],
    "about" TEXT,
    "publicProfileName" TEXT,
    "isSuperAgent" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" TEXT,
    "status" TEXT NOT NULL,
    "pfCreatedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_finder_agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_finder_agents_pfUserId_key" ON "property_finder_agents"("pfUserId");

-- CreateIndex
CREATE UNIQUE INDEX "property_finder_agents_email_key" ON "property_finder_agents"("email");
