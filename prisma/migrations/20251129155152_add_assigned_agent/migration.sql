-- AlterTable
ALTER TABLE "OffPlanProperty" ADD COLUMN     "assignedAgentId" TEXT;

-- AddForeignKey
ALTER TABLE "OffPlanProperty" ADD CONSTRAINT "OffPlanProperty_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
