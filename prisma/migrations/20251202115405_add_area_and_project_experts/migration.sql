/*
  Warnings:

  - You are about to drop the column `pfDeveloperId` on the `Developer` table. All the data in the column will be lost.
  - You are about to drop the column `assignedAgentId` on the `OffPlanProperty` table. All the data in the column will be lost.
  - You are about to drop the `DeveloperSyncRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OffPlanProperty" DROP CONSTRAINT "OffPlanProperty_assignedAgentId_fkey";

-- AlterTable
ALTER TABLE "Developer" DROP COLUMN "pfDeveloperId";

-- AlterTable
ALTER TABLE "OffPlanProperty" DROP COLUMN "assignedAgentId",
ADD COLUMN     "areaExperts" JSONB,
ADD COLUMN     "projectExperts" TEXT[];

-- DropTable
DROP TABLE "DeveloperSyncRecord";
