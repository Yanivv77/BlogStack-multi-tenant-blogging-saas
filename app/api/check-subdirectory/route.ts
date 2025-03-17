import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/app/utils/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdirectory = searchParams.get("subdirectory");

    if (!subdirectory) {
      return NextResponse.json({ error: "Subdirectory parameter is required" }, { status: 400 });
    }

    // Check if the subdirectory already exists
    const existingSite = await prisma.site.findFirst({
      where: { subdirectory },
    });

    return NextResponse.json({ isUnique: !existingSite });
  } catch (error) {
    console.error("Error checking subdirectory:", error);
    return NextResponse.json({ error: "Failed to check subdirectory" }, { status: 500 });
  }
}
