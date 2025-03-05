-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "postCoverImage" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Site" ALTER COLUMN "siteImageCover" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profileImage" DROP NOT NULL;
