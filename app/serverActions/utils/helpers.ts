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

/**
 * Ensures the user exists in the database
 * Creates the user if not found
 * @param user The authenticated user from Kinde
 * @returns The user if successful, null if failed
 */
export async function ensureUserInDatabase(user: any) {
  if (!user || !user.id) {
    logger.warn("Cannot ensure user in database - missing user or user ID");
    return null;
  }
  
  try {
    // Check if user exists
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    
    // If user doesn't exist, create them
    if (!dbUser) {
      logger.info("User not found in database, creating user record", { userId: user.id });
      
      return await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || "",
          firstName: user.given_name || "",
          lastName: user.family_name || "",
          profileImage: user.picture || null,
        },
      });
    }
    
    logger.debug("User exists in database", { userId: user.id });
    return dbUser;
  } catch (error) {
    logger.error("Error ensuring user in database", error, { userId: user.id });
    return null;
  }
} 