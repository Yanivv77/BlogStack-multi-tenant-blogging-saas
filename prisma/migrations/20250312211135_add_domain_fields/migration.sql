-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "domainVerified" BOOLEAN NOT NULL DEFAULT false;
