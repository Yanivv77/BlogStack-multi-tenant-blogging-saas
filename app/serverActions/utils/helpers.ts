"use server";

import { parseWithZod } from "@conform-to/zod";
import prisma from "../../utils/db";
import { requireUser } from "../../utils/requireUser";

// Types for action responses
export type ActionError = { status: "error"; errors: string[] };
export type ActionSuccess = { status: "success"; errors: never[] };
export type ActionResponse = ActionError | ActionSuccess;
export type SubmissionResult = ReturnType<typeof parseWithZod>;

/**
 * Helper functions for creating consistent response objects
 */
export const createErrorResponse = (message: string): ActionError => ({
  status: "error",
  errors: [message],
});

export const createSuccessResponse = (): ActionSuccess => ({
  status: "success",
  errors: [],
});

/**
 * Converts a value to a string or null
 * Useful for optional fields in database operations
 */
export const toNullable = (value: unknown): string | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return String(value);
};

/**
 * Ensures the user is authenticated and returns the user object
 * If not authenticated, returns null
 */
export async function getAuthenticatedUser() {
  try {
    const user = await requireUser();
    if (!user || !user.id) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Verifies that the user owns the specified site
 * Returns the site if owned, null otherwise
 */
export async function verifyUserOwnsSite(siteId: string, userId: string) {
  if (!siteId || !userId) return null;
  
  return await prisma.site.findFirst({
    where: {
      id: siteId,
      userId,
    },
  });
} 