/*
  Warnings:

  - Made the column `assignedAgentId` on table `OffPlanProperty` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "OffPlanProperty" DROP CONSTRAINT "OffPlanProperty_assignedAgentId_fkey";

-- AlterTable
ALTER TABLE "OffPlanProperty" ALTER COLUMN "assignedAgentId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "OffPlanProperty" ADD CONSTRAINT "OffPlanProperty_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
