/*
  Warnings:

  - You are about to drop the `OtpAttempt` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otpLockedUntil" TIMESTAMP(3);

-- DropTable
DROP TABLE "OtpAttempt";
