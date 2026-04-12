import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

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
      {
        name: "Áo thun basic",
        price: 199000,
        stock: 120,
        imageUrl:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      },
      {
        name: "Quần jean slim",
        price: 499000,
        stock: 45,
        imageUrl:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
      },
      {
        name: "Giày sneaker",
        price: 899000,
        stock: 30,
        imageUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      },
      {
        name: "Túi tote canvas",
        price: 159000,
        stock: 80,
        imageUrl:
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80",
      },
      {
        name: "Mũ lưỡi trai",
        price: 129000,
        stock: 60,
        imageUrl:
          "https://images.unsplash.com/photo-1588850561407-ed2c9d3dea95?w=600&q=80",
      },
      {
        name: "Áo khoác gió",
        price: 649000,
        stock: 40,
        imageUrl:
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
      },
      {
        name: "Đồng hồ thể thao",
        price: 1290000,
        stock: 25,
        imageUrl:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      },
      {
        name: "Balo laptop",
        price: 359000,
        stock: 55,
        imageUrl:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
      },
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