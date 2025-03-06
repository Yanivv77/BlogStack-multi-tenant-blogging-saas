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
        const existingSlug = await prisma.post.findUnique({
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

  const data = await prisma.post.create({
    data: {
      title: submission.value.title,
      smallDescription: submission.value.smallDescription,
      slug: submission.value.slug,
      articleContent: JSON.parse(submission.value.articleContent),
      postCoverImage: submission.value.postCoverImage || null,
      contentImages: submission.value.contentImages ? JSON.parse(submission.value.contentImages) : null,
      userId: user.id,
      siteId: formData.get("siteId") as string,
    },
  });

  return redirect(`/dashboard/sites/${formData.get("siteId")}`);
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

  const data = await prisma.post.delete({
    where: {
      userId: user.id,
      id: formData.get("articleId") as string,
    },
  });

  return redirect(`/dashboard/sites/${formData.get("siteId")}`);
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