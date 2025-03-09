import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const requireUser = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return null;
  }

  return user;
};