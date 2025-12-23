-- CreateTable
CREATE TABLE "OffPlanProperty" (
    "id" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "emirate" TEXT NOT NULL,
    "launchType" TEXT NOT NULL,
    "projectHighlight" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "plotArea" DOUBLE PRECISION,
    "area" DOUBLE PRECISION NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "kitchens" INTEGER,
    "bathrooms" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OffPlanProperty_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OffPlanProperty" ADD CONSTRAINT "OffPlanProperty_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
