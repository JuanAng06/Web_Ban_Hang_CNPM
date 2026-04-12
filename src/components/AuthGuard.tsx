"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readAuthUser } from "@/lib/authStorage";

type AuthGuardProps = {
  children: ReactNode;
};

/**
 * Chỉ render children khi đã có user trong localStorage; không thì chuyển /login.
 * Dùng cho /checkout và các trang cần đăng nhập sau này.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = readAuthUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <main className="mx-auto max-w-lg p-8 text-center text-gray-600">
        Đang kiểm tra phiên đăng nhập...
      </main>
    );
  }

  return <>{children}</>;
}
