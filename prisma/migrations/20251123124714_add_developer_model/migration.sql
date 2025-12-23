/*
  Warnings:

  - You are about to drop the column `otpAttempts` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpLockedUntil` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "otpAttempts",
DROP COLUMN "otpLockedUntil";

-- CreateTable
CREATE TABLE "OtpDeviceLock" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpDeviceLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Developer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "logoUrl" TEXT,
    "about" TEXT,
    "salesManagerName" TEXT NOT NULL,
    "salesManagerEmail" TEXT NOT NULL,
    "salesManagerPhone" TEXT NOT NULL,
    "salesManagerPhotoUrl" TEXT,
    "nationality" TEXT,
    "languages" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtpDeviceLock_userId_deviceId_key" ON "OtpDeviceLock"("userId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Developer_email_key" ON "Developer"("email");

-- AddForeignKey
ALTER TABLE "OtpDeviceLock" ADD CONSTRAINT "OtpDeviceLock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
