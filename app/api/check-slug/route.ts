import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/app/utils/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const siteId = searchParams.get("siteId");

    if (!slug) {
      return NextResponse.json({ error: "Slug parameter is required" }, { status: 400 });
    }

    if (!siteId) {
      return NextResponse.json({ error: "Site ID parameter is required" }, { status: 400 });
    }

    // Check if the slug already exists for this site
    const existingPost = await prisma.post.findFirst({
      where: {
        slug,
        siteId,
        deletedAt: null, // Only check non-deleted posts
      },
    });

    return NextResponse.json({
      isUnique: !existingPost,
      slug,
    });
  } catch (error) {
    console.error("Error checking slug:", error);
    return NextResponse.json({ error: "Failed to check slug availability" }, { status: 500 });
  }
}
