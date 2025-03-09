/*
  Warnings:

  - You are about to drop the column `enableComments` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `showDateOnPosts` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `siteKeywords` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `siteTagline` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `themeColor` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `twitterUrl` on the `Site` table. All the data in the column will be lost.
  - The `language` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('English', 'Hebrew');

-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'PRIVATE');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Site" DROP COLUMN "enableComments",
DROP COLUMN "showDateOnPosts",
DROP COLUMN "siteKeywords",
DROP COLUMN "siteTagline",
DROP COLUMN "themeColor",
DROP COLUMN "twitterUrl",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "logoImage" TEXT,
ADD COLUMN     "status" "SiteStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "theme" TEXT,
DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'English';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Post_slug_idx" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_siteId_idx" ON "Post"("siteId");

-- CreateIndex
CREATE INDEX "Site_userId_idx" ON "Site"("userId");

-- CreateIndex
CREATE INDEX "Site_subdirectory_idx" ON "Site"("subdirectory");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
