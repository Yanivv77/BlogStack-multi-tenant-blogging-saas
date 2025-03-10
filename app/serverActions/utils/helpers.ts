"use server";

import { parseWithZod } from "@conform-to/zod";
import prisma from "../../utils/db/prisma";
import { requireUser } from "../../utils/auth/user";
import { serverLogger } from "../../utils/logger";

// Setup logger
const logger = serverLogger("ServerActionHelpers");

// Types for action responses
export type ActionError = { status: "error"; errors: string[] };
export type ActionSuccess = { status: "success"; errors: never[] };
export type ActionResponse = ActionError | ActionSuccess;
export type SubmissionResult = ReturnType<typeof parseWithZod>;

/**
 * Helper functions for creating consistent response objects
 */
export async function createErrorResponse(message: string): Promise<ActionError> {
  logger.error("Error response created", null, { message });
  return {
    status: "error",
    errors: [message],
  };
}

export async function createSuccessResponse(): Promise<ActionSuccess> {
  logger.debug("Success response created");
  return {
    status: "success",
    errors: [],
  };
}

/**
 * Converts a value to a string or null
 * Useful for optional fields in database operations
 */
export async function toNullable(value: unknown): Promise<string | null> {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return String(value);
}

/**
 * Ensures the user is authenticated and returns the user object
 * If not authenticated, returns null
 */
export async function getAuthenticatedUser() {
  try {
    const user = await requireUser();
    if (!user || !user.id) {
      logger.warn("User authentication failed - no user ID");
      return null;
    }
    logger.debug("User authenticated successfully", { userId: user.id });
    return user;
  } catch (error) {
    logger.error("User authentication error", error);
    return null;
  }
}

/**
 * Verifies that the user owns the specified site
 * Returns the site if owned, null otherwise
 */
export async function verifyUserOwnsSite(siteId: string, userId: string) {
  if (!siteId || !userId) {
    logger.warn("Site verification failed - missing siteId or userId", { siteId, userId });
    return null;
  }
  
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      userId,
    },
  });
  
  if (!site) {
    logger.warn("Site verification failed - site not found or not owned by user", { siteId, userId });
  } else {
    logger.debug("Site verification successful", { siteId, userId });
  }
  
  return site;
} 