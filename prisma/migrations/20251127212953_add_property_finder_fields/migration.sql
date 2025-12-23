/*
  Warnings:

  - You are about to drop the `property_finder_agents` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "experienceSince" INTEGER,
ADD COLUMN     "linkedinAddress" TEXT,
ADD COLUMN     "phoneSecondary" TEXT;

-- DropTable
DROP TABLE "property_finder_agents";
