"use client";

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface ProductCardProps {
  product: Product;
}

/**
 * Card hiển thị thông tin cơ bản của một sản phẩm.
 * Nút "Thêm vào giỏ" tạm thời chỉ log product id để phục vụ bước tiếp theo.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const handleAddToCart = () => {
    console.log("Thêm sản phẩm:", product.id);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-48 w-full rounded-md object-cover"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center rounded-md bg-gray-100 text-sm text-gray-500">
          Ảnh placeholder
        </div>
      )}

      <h3 className="mt-4 text-lg font-semibold text-gray-900">{product.name}</h3>
      <p className="mt-1 text-base font-medium text-indigo-600">
        {product.price.toLocaleString("vi-VN")} đ
      </p>

      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-4 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        Thêm vào giỏ
      </button>
    </div>
  );
}
