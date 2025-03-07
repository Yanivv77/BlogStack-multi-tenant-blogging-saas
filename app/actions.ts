"use server"

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { PostCreationSchema, PostEditSchema, PostSchema, SiteCreationSchema, siteSchema } from "./utils/zodSchemas";
import prisma from "./utils/db";
import { requireUser } from "./utils/requireUser";

export async function CreateSiteAction(prevState: any, formData: FormData) {
  const user = await requireUser();

 if(!user || !user.id) {
     return redirect("/api/auth/login")
 }

 const submission = await parseWithZod(formData, {
  schema: SiteCreationSchema({
    async isSubdirectoryUnique() {
      const exisitngSubDirectory = await prisma.site.findUnique({
        where: {
          subdirectory: formData.get("subdirectory") as string,
        },
      });
      return !exisitngSubDirectory;
    },
  }),
  async: true,
});

  if (submission.status !== "success") {
    return submission.reply();
  }

 const response = await prisma.site.create({
  data: {
    description: submission.value.description,
    name: submission.value.name,
    subdirectory: submission.value.subdirectory,
    userId: user.id,
    siteImageCover: submission.value.siteImageCover || null 
  },
});

return redirect("/dashboard/sites");
 
}


export async function CreatePostAction(prevState: any, formData: FormData) {
  const user = await requireUser();

  const submission = await parseWithZod(formData, {
    schema: PostCreationSchema({
      async isSlugUnique() {
        const existingSlug = await prisma.post.findFirst({
          where: {
            slug: formData.get("slug") as string,
          },
        });
        return !existingSlug;
      },
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    // Process content images
    let contentImages;
    if (submission.value.contentImages) {
      try {
        contentImages = JSON.parse(submission.value.contentImages);
      } catch (e) {
        contentImages = []; // Default to empty array if parsing fails
      }
    }

    // Get siteId from formData since it's not part of the schema
    const siteId = formData.get("siteId") as string;
    if (!siteId) {
      return { status: "error", errors: ["Site ID is required"] };
    }

    // Create post in database
    await prisma.post.create({
      data: {
        title: submission.value.title,
        smallDescription: submission.value.smallDescription,
        slug: submission.value.slug,
        articleContent: JSON.parse(submission.value.articleContent),
        postCoverImage: submission.value.postCoverImage || null,
        contentImages: contentImages || [],
        siteId: siteId,
        userId: user.id,
      },
    });

    // Return success status for client-side handling
    return { status: "success", errors: [] };
  } catch (error) {
    console.error("Error creating article:", error);
    return { status: "error", errors: ["Failed to create article. Please try again."] };
  }
}

export async function EditPostActions(prevState: any, formData: FormData) {
  const user = await requireUser();
  const articleId = formData.get("articleId") as string;

  const submission = await parseWithZod(formData, {
    schema: PostEditSchema({
      async isSlugUnique() {
        const existingSlug = await prisma.post.findFirst({
          where: {
            slug: formData.get("slug") as string,
            id: { not: articleId }, // Exclude the current post
          },
        });
        return !existingSlug;
      },
      currentPostId: articleId,
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.post.update({
    where: {
      userId: user.id,
      id: articleId,
    },
    data: {
      title: submission.value.title,
      smallDescription: submission.value.smallDescription,
      slug: submission.value.slug,
      articleContent: JSON.parse(submission.value.articleContent),
      postCoverImage: submission.value.postCoverImage || null,
      contentImages: submission.value.contentImages ? JSON.parse(submission.value.contentImages) : null
    },
  });

  return redirect(`/dashboard/sites/${formData.get("siteId")}`);
}

export async function DeletePost(formData: FormData) {
  const user = await requireUser();
  
  if (!user || !user.id) {
    return { status: "error", errors: ["You must be logged in to delete an article"] };
  }
  
  const articleId = formData.get("articleId") as string;
  const siteId = formData.get("siteId") as string;
  
  if (!articleId || !siteId) {
    return { status: "error", errors: ["Missing article or site information"] };
  }

  try {
    // First verify the article belongs to the user
    const article = await prisma.post.findFirst({
      where: {
        id: articleId,
        userId: user.id,
      },
    });

    if (!article) {
      return { status: "error", errors: ["Article not found or you don't have permission to delete it"] };
    }

    // Delete the article
    await prisma.post.delete({
      where: {
        id: articleId,
        userId: user.id,
      },
    });

    return { status: "success", errors: [] };
  } catch (error) {
    console.error("Error deleting article:", error);
    return { status: "error", errors: ["Failed to delete article. Please try again."] };
  }
}

export async function UpdateImage(formData: FormData) {
  const user = await requireUser();
  
  const siteImageCoverValue = formData.get("siteImageCover");
  const siteImageCover = siteImageCoverValue ? String(siteImageCoverValue) : null;
  
  console.log("Updating site image:", siteImageCover);
  
  const data = await prisma.site.update({
    where: {
      userId: user.id,
      id: formData.get("siteId") as string,
    },
    data: {
      siteImageCover
    },
  });

  console.log("Updated site with image:", data.siteImageCover);
  return redirect(`/dashboard/sites/${formData.get("siteId")}`);
}

export async function DeleteSite(formData: FormData) {
  const user = await requireUser();

  const data = await prisma.site.delete({
    where: {
      userId: user.id,
      id: formData.get("siteId") as string,
    },
  });

  return redirect("/dashboard/sites");
}