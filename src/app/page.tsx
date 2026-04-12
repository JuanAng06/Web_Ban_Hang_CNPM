"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CartSidebar from "@/components/CartSidebar";
import ProductCard, { type Product } from "@/components/ProductCard";
import { clearAuthUser, readAuthUser, type AuthUser } from "@/lib/authStorage";
import { useCartStore } from "@/store/cartStore";

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`API lỗi: ${response.status}`);
        }

        const data = (await response.json()) as Product[];
        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Không thể tải sản phẩm:", err);
        if (!cancelled) {
          setError("Không thể tải sản phẩm, vui lòng thử lại sau");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="p-4 text-center">Đang tải sản phẩm...</p>;
  }

  if (error) {
    return <p className="p-4 text-center text-red-600">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    setAuthUser(readAuthUser());
  }, []);

  const totalItems = useCartStore((s) =>
    s.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  const handleLogout = () => {
    clearAuthUser();
    setAuthUser(null);
  };

  const displayName =
    authUser?.name?.trim() ||
    authUser?.email?.split("@")[0] ||
    "Người dùng";

  return (
    <main className="relative mx-auto max-w-7xl py-8">
      <header className="relative mx-4 mb-6 flex flex-col gap-4 rounded-xl bg-gradient-to-r from-slate-800 via-slate-800 to-indigo-900 px-4 py-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white drop-shadow-sm">
          Danh sách sản phẩm
        </h1>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {authUser === undefined ? (
            <span className="text-sm text-indigo-200">…</span>
          ) : authUser ? (
            <>
              <span
                className="max-w-[220px] truncate text-sm text-indigo-100"
                title={authUser.email}
              >
                Xin chào,{" "}
                <strong className="font-semibold text-white">{displayName}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-md transition hover:bg-indigo-500"
              >
                Đăng ký
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative rounded-full border border-white/25 bg-white/95 p-3 shadow-md transition hover:bg-white"
            aria-label="Mở giỏ hàng"
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3M7.5 14.25H5.106c-.532 0-.816-.469-.716-.93l1.09-4.5M7.5 14.25l-1.09-4.5m0 0 .697-2.902m0 0L9.75 3.75h8.25m-8.25 0-1.09 4.5m9.75 0h1.5a.75.75 0 0 1 .742.865l-1.5 6A.75.75 0 0 1 18.75 18H6.75a.75.75 0 0 1-.742-.865l1.5-6a.75.75 0 0 1 .742-.635Z"
            />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-bold text-white">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </button>
        </div>
      </header>

      <ProductList />

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </main>
  );
}
