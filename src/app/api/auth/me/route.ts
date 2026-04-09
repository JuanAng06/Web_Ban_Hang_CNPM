import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/me
 * Route tạm để kiểm tra "user hiện tại".
 * Hiện chưa có session thật, nên lấy email từ header `x-user-email`.
 */
export async function GET(request: Request) {
  try {
    const email = request.headers.get("x-user-email")?.trim() ?? "";
    if (!email) {
      return Response.json(
        {
          error:
            "Thiếu header x-user-email. Ví dụ: x-user-email: your@email.com",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return Response.json({ error: "Không tìm thấy user." }, { status: 404 });
    }

    return Response.json({ user }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/auth/me]", error);
    return Response.json({ error: "Lỗi máy chủ nội bộ." }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
