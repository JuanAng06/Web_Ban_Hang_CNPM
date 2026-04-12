import { prisma } from "@/lib/prisma";
import { isValidVnPhone09 } from "@/lib/vnPhone";

/** Một dòng trong body giỏ hàng gửi lên server. */
type CartItemBody = {
  productId: string;
  quantity: number;
  price: number;
};

type CreateOrderBody = {
  cartItems?: CartItemBody[];
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string | null;
  userId?: string;
};

type MergedLine = { quantity: number; price: number };

/**
 * Gộp các dòng trùng productId (cộng quantity, giữ price từ lần xuất hiện đầu).
 */
function mergeCartItems(items: CartItemBody[]): Map<string, MergedLine> {
  const map = new Map<string, MergedLine>();
  for (const row of items) {
    const id = row.productId?.trim();
    if (!id) continue;
    const q = Math.floor(Number(row.quantity));
    const price = Number(row.price);
    if (!Number.isFinite(q) || q <= 0) continue;
    if (!Number.isFinite(price) || price < 0) continue;
    const existing = map.get(id);
    if (existing) {
      existing.quantity += q;
    } else {
      map.set(id, { quantity: q, price });
    }
  }
  return map;
}

const PRICE_EPS = 0.01;

/**
 * POST /api/orders
 * Tạo đơn hàng + chi tiết + giảm tồn kho trong một transaction (atomic).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderBody;
    const cartItems = body.cartItems;
    const customerName = body.customerName?.trim() ?? "";
    const customerAddress = body.customerAddress?.trim() ?? "";
    const customerPhone = (body.customerPhone ?? "").trim().replace(/\D/g, "");
    const userId = body.userId?.trim() ?? "";

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return Response.json(
        { error: "Giỏ hàng không được để trống." },
        { status: 400 }
      );
    }

    if (!customerName || !customerAddress) {
      return Response.json(
        { error: "Tên khách hàng và địa chỉ là bắt buộc." },
        { status: 400 }
      );
    }

    if (!customerPhone || !isValidVnPhone09(customerPhone)) {
      return Response.json(
        {
          error:
            "Số điện thoại bắt buộc: 10 chữ số, bắt đầu bằng 09 (ví dụ 0912345678).",
        },
        { status: 400 }
      );
    }

    if (!userId) {
      return Response.json({ error: "userId là bắt buộc." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return Response.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    const merged = mergeCartItems(cartItems);
    if (merged.size === 0) {
      return Response.json(
        { error: "Giỏ hàng không có dòng hợp lệ (productId, quantity > 0, price >= 0)." },
        { status: 400 }
      );
    }

    const productIds = Array.from(merged.keys());
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      const found = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !found.has(id));
      return Response.json(
        {
          error: "Một hoặc nhiều sản phẩm không tồn tại.",
          missingProductIds: missing,
        },
        { status: 400 }
      );
    }

    /**
     * total = sum(price * quantity) theo body (sau khi gộp dòng).
     * So sánh giá client với DB để tránh chỉnh sửa giảm giá từ phía client.
     */
    const lines: { productId: string; quantity: number; unitPrice: number }[] =
      [];
    let total = 0;

    for (const p of products) {
      const line = merged.get(p.id)!;
      const { quantity, price: clientPrice } = line;

      if (p.stock < quantity) {
        return Response.json(
          {
            error: `Sản phẩm "${p.name}" không đủ hàng (còn ${p.stock}, cần ${quantity}).`,
            productId: p.id,
          },
          { status: 400 }
        );
      }

      if (Math.abs(clientPrice - p.price) > PRICE_EPS) {
        return Response.json(
          {
            error: `Giá sản phẩm "${p.name}" không khớp. Vui lòng tải lại trang và thử lại.`,
            productId: p.id,
          },
          { status: 400 }
        );
      }

      total += clientPrice * quantity;
      lines.push({ productId: p.id, quantity, unitPrice: clientPrice });
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          customerName,
          customerAddress,
          customerPhone,
          total,
          status: "pending",
        },
      });

      for (const line of lines) {
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: line.productId,
            quantity: line.quantity,
            price: line.unitPrice,
          },
        });

        await tx.product.update({
          where: { id: line.productId },
          data: { stock: { decrement: line.quantity } },
        });
      }

      return created;
    });

    return Response.json(
      { orderId: order.id, message: "Đặt hàng thành công" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
    }
    console.error("[POST /api/orders]", error);
    return Response.json(
      { error: "Không thể tạo đơn hàng" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
