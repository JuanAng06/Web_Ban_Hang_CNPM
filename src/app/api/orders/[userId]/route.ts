import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: { userId: string };
};

/**
 * GET /api/orders/[userId]
 * Danh sách đơn hàng của user, kèm chi tiết dòng và thông tin sản phẩm.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const userId = params.userId?.trim();
    if (!userId) {
      return Response.json({ error: "Thiếu userId." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return Response.json(
        { error: "Không tìm thấy người dùng với userId này." },
        { status: 404 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return Response.json(orders, { status: 200 });
  } catch (error) {
    console.error("[GET /api/orders/[userId]]", error);
    return Response.json(
      { error: "Không thể tải lịch sử đơn hàng." },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
