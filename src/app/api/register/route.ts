import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RegisterBody = {
  email?: string;
  password?: string;
  name?: string;
};

/**
 * POST /api/register
 * Tạo tài khoản mới với mật khẩu đã hash bằng bcrypt.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const name = body.name?.trim() || null;

    // Validate các field bắt buộc.
    if (!email || !password) {
      return Response.json(
        { error: "Email và mật khẩu là bắt buộc." },
        { status: 400 }
      );
    }

    // Hash mật khẩu trước khi lưu DB.
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      // Chỉ trả field an toàn, không lộ password.
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return Response.json(
      { message: "Đăng ký thành công", user },
      { status: 201 }
    );
  } catch (error) {
    // Prisma P2002: unique constraint failed (email trùng).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "Email đã tồn tại, vui lòng dùng email khác." },
        { status: 409 }
      );
    }

    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Body JSON không hợp lệ." },
        { status: 400 }
      );
    }

    console.error("[POST /api/register]", error);
    return Response.json({ error: "Lỗi máy chủ nội bộ." }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
