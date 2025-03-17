import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton to prevent multiple instances in development
 * @returns A new PrismaClient instance
 */
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Type declaration for global prisma instance
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Use existing prisma instance if available, otherwise create a new one
const prisma = global.prismaGlobal ?? prismaClientSingleton();

// In development, save the prisma instance to avoid hot reloading issues
if (process.env.NODE_ENV !== "production") global.prismaGlobal = prisma;

export default prisma;
