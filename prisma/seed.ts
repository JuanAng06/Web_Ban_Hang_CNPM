import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Bắt đầu seed database...");

  // ===== XÓA DỮ LIỆU CŨ (tránh trùng lặp) =====
  console.log("🗑️ Đang xóa dữ liệu cũ...");
  
  await prisma.orderItem.deleteMany();
  console.log("  - Đã xóa OrderItem");
  
  await prisma.order.deleteMany();
  console.log("  - Đã xóa Order");
  
  await prisma.product.deleteMany();
  console.log("  - Đã xóa Product");
  
  await prisma.user.deleteMany();
  console.log("  - Đã xóa User");
  
  console.log("✅ Đã xóa toàn bộ dữ liệu cũ");

  // ===== THÊM DỮ LIỆU MỚI =====
  console.log("📦 Đang thêm sản phẩm mới...");
  
  const products = await prisma.product.createMany({
    data: [
      { name: "Áo thun basic", price: 199000, stock: 120, imageUrl: null },
      { name: "Quần jean slim", price: 499000, stock: 45, imageUrl: null },
      { name: "Giày sneaker", price: 899000, stock: 30, imageUrl: null },
      { name: "Túi tote canvas", price: 159000, stock: 80, imageUrl: null },
      { name: "Mũ lưỡi trai", price: 129000, stock: 60, imageUrl: null },
    ],
  });

  console.log(`✅ Đã thêm ${products.count} sản phẩm thành công!`);
  console.log("🎉 Seed hoàn tất!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Lỗi khi seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });