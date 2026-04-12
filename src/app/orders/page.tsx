"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { readAuthUser, type AuthUser } from "@/lib/authStorage";

type OrderItemRow = {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
};

type OrderRow = {
  id: string;
  userId: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItemRow[];
};

function formatDateDdMmYyyy(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function OrderHistoryContent() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = readAuthUser();
    setUser(u);
    if (!u?.id) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(u.id)}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            typeof data?.error === "string"
              ? data.error
              : `Lỗi ${res.status}`
          );
        }
        if (!cancelled) {
          setOrders(Array.isArray(data) ? (data as OrderRow[]) : []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Không thể tải lịch sử đơn hàng."
          );
          setOrders(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
          {user?.email && (
            <p className="mt-1 text-sm text-gray-600">{user.email}</p>
          )}
        </div>
        <Link
          href="/"
          className="inline-flex w-fit items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
        >
          ← Quay lại trang chủ
        </Link>
      </div>

      {loading && (
        <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
          Đang tải đơn hàng...
        </p>
      )}

      {!loading && error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}

      {!loading && !error && orders && orders.length === 0 && (
        <p className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
          Chưa có đơn hàng nào.
        </p>
      )}

      {!loading && !error && orders && orders.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <header className="border-b border-gray-100 pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Mã đơn
                    </p>
                    <p className="break-all font-mono text-sm text-gray-900">
                      {order.id}
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-800">
                    {order.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Ngày đặt:{" "}
                  <span className="font-medium text-gray-900">
                    {formatDateDdMmYyyy(order.createdAt)}
                  </span>
                </p>
              </header>

              <section className="mt-3 space-y-1 text-sm text-gray-700">
                <p>
                  <span className="text-gray-500">Khách hàng:</span>{" "}
                  {order.customerName}
                </p>
                <p>
                  <span className="text-gray-500">Địa chỉ:</span>{" "}
                  {order.customerAddress}
                </p>
                {order.customerPhone && (
                  <p>
                    <span className="text-gray-500">Điện thoại:</span>{" "}
                    {order.customerPhone}
                  </p>
                )}
              </section>

              <section className="mt-4">
                <h2 className="mb-2 text-sm font-semibold text-gray-900">
                  Sản phẩm
                </h2>
                <ul className="divide-y divide-gray-100 rounded-md border border-gray-100">
                  {order.items.map((line) => (
                    <li
                      key={line.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-gray-900">
                        {line.product.name}
                      </span>
                      <span className="text-gray-600">
                        SL: {line.quantity} ×{" "}
                        {line.price.toLocaleString("vi-VN")} đ
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <footer className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-medium text-gray-700">
                  Tổng tiền
                </span>
                <span className="text-lg font-bold text-indigo-700">
                  {order.total.toLocaleString("vi-VN")} đ
                </span>
              </footer>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrderHistoryContent />
    </AuthGuard>
  );
}
