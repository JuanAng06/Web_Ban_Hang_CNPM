import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

type LoginBody = {
  email?: string;
  password?: string;
};

/**
 * POST /api/login
 * Xác thực user bằng email + password (bcrypt compare).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    // Validate input bắt buộc.
    if (!email || !password) {
      return Response.json(
        { error: "Email và mật khẩu là bắt buộc." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Không tiết lộ cụ thể email hay password sai.
    if (!user) {
      return Response.json(
        { error: "Email không tồn tại" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { error: "Sai email hoặc mật khẩu" },
        { status: 401 }
      );
    }

    return Response.json(
      {
        message: "Đăng nhập thành công",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Body JSON không hợp lệ." },
        { status: 400 }
      );
    }

    console.error("[POST /api/login]", error);
    return Response.json({ error: "Lỗi máy chủ nội bộ." }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
