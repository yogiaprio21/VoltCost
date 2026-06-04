ALTER TABLE "Material"
ADD COLUMN "specification" TEXT,
ADD COLUMN "brand" TEXT,
ADD COLUMN "sourceName" TEXT,
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "sourceType" TEXT NOT NULL DEFAULT 'seed',
ADD COLUMN "priceUpdatedAt" TIMESTAMP(3),
ADD COLUMN "standardRef" TEXT,
ADD COLUMN "notes" TEXT;
