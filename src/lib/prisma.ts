import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Trong Prisma 7 với SQLite, bắt buộc truyền driver adapter khi tạo PrismaClient.
 * Chuỗi kết nối lấy từ DATABASE_URL (file .env), ví dụ: file:./dev.db
 */
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  return new PrismaClient({ adapter });
}

/**
 * Next.js trong môi trường dev có thể hot-reload nhiều lần, dễ tạo nhiều instance PrismaClient
 * → tràn kết nối / cảnh báo. Dùng biến global để giữ một singleton cho cả process.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
