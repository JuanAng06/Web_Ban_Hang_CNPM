"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar giỏ hàng: overlay + panel trượt từ phải, quản lý số lượng / xóa / tổng tiền.
 */
export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const getTotalItems = useCartStore((s) => s.getTotalItems);

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <>
      {/* Nền mờ: click để đóng */}
      <div
        role="presentation"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel trượt từ phải */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">Giỏ hàng</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Đóng
          </button>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden">
          {items.length === 0 ? (
            <p className="p-4 text-center text-sm text-gray-500">
              Giỏ hàng trống.
            </p>
          ) : (
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 p-4 text-sm text-gray-800"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-indigo-600">
                      {item.price.toLocaleString("vi-VN")} đ
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Giảm số lượng"
                        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-50"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Tăng số lượng"
                        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-50"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ml-auto text-xs font-medium text-red-600 hover:underline"
                        onClick={() => removeItem(item.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-gray-200 p-4">
          <div className="mb-3 flex justify-between text-sm text-gray-600">
            <span>Số lượng ({totalItems} sản phẩm)</span>
            <span className="font-semibold text-gray-900">
              {totalPrice.toLocaleString("vi-VN")} đ
            </span>
          </div>
          <Link
            href="/orders"
            onClick={onClose}
            className="mb-2 block w-full rounded-md border border-gray-300 bg-white py-2.5 text-center text-sm font-medium text-gray-800 transition hover:bg-gray-50"
          >
            Lịch sử đơn hàng
          </Link>
          <Link
            href="/checkout"
            onClick={onClose}
            className={`block w-full rounded-md bg-indigo-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-indigo-700 ${
              items.length === 0 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Thanh toán
          </Link>
        </footer>
      </aside>
    </>
  );
}
