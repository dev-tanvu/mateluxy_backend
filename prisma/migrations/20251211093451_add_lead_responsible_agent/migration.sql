-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "responsibleAgentId" TEXT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_responsibleAgentId_fkey" FOREIGN KEY ("responsibleAgentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
