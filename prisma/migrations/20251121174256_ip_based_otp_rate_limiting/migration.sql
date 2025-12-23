/*
  Warnings:

  - You are about to drop the column `otpAttempts` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpLockedUntil` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "otpAttempts",
DROP COLUMN "otpLockedUntil";

-- CreateTable
CREATE TABLE "OtpAttempt" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "lockedUntil" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpAttempt_ipAddress_idx" ON "OtpAttempt"("ipAddress");

-- CreateIndex
CREATE INDEX "OtpAttempt_username_idx" ON "OtpAttempt"("username");

-- CreateIndex
CREATE UNIQUE INDEX "OtpAttempt_ipAddress_username_key" ON "OtpAttempt"("ipAddress", "username");
