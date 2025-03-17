import { redirect } from "next/navigation";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

/**
 * Requires a user to be authenticated
 * Redirects to login if not authenticated
 * @returns The authenticated user or redirects
 */
export const requireUser = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  return user;
};

/**
 * Gets the current user if authenticated
 * Returns null if not authenticated (no redirect)
 * @returns The authenticated user or null
 */
export const getCurrentUser = async () => {
  const { getUser } = getKindeServerSession();
  return await getUser();
};
