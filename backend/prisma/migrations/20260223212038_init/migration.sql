-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('cable', 'mcb', 'switch', 'socket', 'panel', 'conduit');

-- CreateEnum
CREATE TYPE "InstallationType" AS ENUM ('standard', 'premium');

-- CreateTable
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "unit" TEXT NOT NULL,
    "pricePerUnit" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "houseArea" INTEGER NOT NULL,
    "lampPoints" INTEGER NOT NULL,
    "socketPoints" INTEGER NOT NULL,
    "acCount" INTEGER NOT NULL,
    "pumpCount" INTEGER NOT NULL,
    "powerCapacity" INTEGER NOT NULL,
    "installationType" "InstallationType" NOT NULL,
    "breakdown" JSONB NOT NULL,
    "totalCost" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "Estimation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Material_name_type_key" ON "Material"("name", "type");
