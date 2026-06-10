import { PrismaClient } from "@/generated/prisma";

// Singleton pattern para evitar múltiples conexiones en desarrollo con hot-reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
