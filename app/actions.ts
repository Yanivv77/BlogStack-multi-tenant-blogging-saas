"use server"

import { parseWithZod } from "@conform-to/zod";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { SiteCreationSchema, siteSchema } from "./utils/zodSchemas";
import prisma from "./utils/db";
import { requireUser } from "./utils/requireUser";

export async function CreateSiteAction(prevState: any, formData: FormData) {
  const user = await requireUser();

 if(!user || !user.id) {
     return redirect("/api/auth/login")
 }

 const submission = await parseWithZod(
    formData,
    {schema: siteSchema}
 )

 if(submission.status !== "success") {
    return submission.reply()
 }

 const response = await prisma.site.create({
  data: {
    description: submission.value.description,
    name: submission.value.name,
    subdirectory: submission.value.subdirectory,
    userId: user.id,
  },
});

return redirect("/dashboard/sites");
 
}
