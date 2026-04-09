"use client";

import { useEffect, useState } from "react";

/** Kiểu tối thiểu để hiển thị danh sách (khớp với model Product trong Prisma). */
type ProductRow = {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  createdAt: string;
};

/**
 * Trang tạm để kiểm tra API: gọi /api/products từ trình duyệt và hiển thị kết quả.
 */
export default function ProductsTestPage() {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [rawJson, setRawJson] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/products");
        const text = await res.text();
        if (cancelled) return;

        setRawJson(text);

        if (!res.ok) {
          setError(`HTTP ${res.status}: ${text}`);
          setProducts(null);
          return;
        }

        const data = JSON.parse(text) as ProductRow[];
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Lỗi không xác định");
          setProducts(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Kiểm tra API sản phẩm</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Dữ liệu lấy từ <code className="rounded bg-neutral-100 px-1">GET /api/products</code>
        </p>
      </div>

      {loading && <p>Đang tải…</p>}
      {error && (
        <p className="rounded border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}

      {!loading && !error && products && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Danh sách (tên + giá)</h2>
          <ul className="list-inside list-disc space-y-1">
            {products.map((p) => (
              <li key={p.id}>
                <span className="font-medium">{p.name}</span>
                {" — "}
                <span>{p.price.toLocaleString("vi-VN")} đ</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && rawJson && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">JSON thô</h2>
          <pre className="max-h-96 overflow-auto rounded border bg-neutral-50 p-4 text-xs">
            {rawJson}
          </pre>
        </section>
      )}
    </main>
  );
}
