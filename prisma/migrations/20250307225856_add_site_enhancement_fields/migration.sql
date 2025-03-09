-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "enableComments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "showDateOnPosts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "siteKeywords" TEXT,
ADD COLUMN     "siteTagline" TEXT,
ADD COLUMN     "themeColor" TEXT,
ADD COLUMN     "twitterUrl" TEXT;
