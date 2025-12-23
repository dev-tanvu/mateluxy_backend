/*
  Warnings:

  - The `propertyType` column on the `OffPlanProperty` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "OffPlanProperty" ADD COLUMN     "address" TEXT,
ADD COLUMN     "focalPoint" TEXT,
ADD COLUMN     "focalPointImage" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "nearbyHighlights" JSONB,
ADD COLUMN     "style" TEXT,
DROP COLUMN "propertyType",
ADD COLUMN     "propertyType" TEXT[];
