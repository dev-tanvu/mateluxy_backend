-- AlterTable
ALTER TABLE "OffPlanProperty" ALTER COLUMN "emirate" DROP NOT NULL,
ALTER COLUMN "launchType" DROP NOT NULL,
ALTER COLUMN "projectHighlight" DROP NOT NULL,
ALTER COLUMN "area" DROP NOT NULL,
ALTER COLUMN "bedrooms" DROP NOT NULL,
ALTER COLUMN "bathrooms" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_name_key" ON "Amenity"("name");
