"use client";

import { useEffect, useState } from "react";
import ProductCard, { type Product } from "@/components/ProductCard";

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
  return (
    <main className="mx-auto max-w-7xl py-8">
      <h1 className="px-4 text-2xl font-bold text-white-900">Danh sách sản phẩm</h1>
      <ProductList />
    </main>
  );
}
