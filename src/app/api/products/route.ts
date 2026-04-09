import { prisma } from "@/lib/prisma";

/**
 * API Route (App Router): GET /api/products
 * Trả về toàn bộ bản ghi Product từ SQLite qua Prisma.
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json(products, { status: 200 });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return Response.json(
      { error: "Không thể lấy danh sách sản phẩm." },
      { status: 500 }
    );
  }
}

/**
 * better-sqlite3 chỉ chạy trên runtime Node.js, không dùng được trên Edge.
 */
export const runtime = "nodejs";

/** Luôn đọc DB theo từng request, không tối ưu tĩnh tại build. */
export const dynamic = "force-dynamic";
