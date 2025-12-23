-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'SOLD', 'RENTED');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "phoneCountry" TEXT DEFAULT 'AE',
ADD COLUMN     "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE';

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "organizer" TEXT,
    "responsible" TEXT,
    "observers" TEXT[],
    "status" TEXT,
    "dealPrice" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'AED',
    "source" TEXT,
    "closingDate" TIMESTAMP(3),
    "district" TEXT,
    "propertyType" TEXT,
    "developer" TEXT,
    "bedrooms" INTEGER,
    "budgetFrom" DOUBLE PRECISION,
    "budgetTo" DOUBLE PRECISION,
    "areaFrom" TEXT,
    "areaTo" TEXT,
    "additionalContent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
