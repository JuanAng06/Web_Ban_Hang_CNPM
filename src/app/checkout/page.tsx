"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { readAuthUser } from "@/lib/authStorage";
import { isValidVnPhone09, normalizeDigitsPhoneInput } from "@/lib/vnPhone";
import { useCartStore } from "@/store/cartStore";

function CheckoutContent() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Sau khi đặt hàng thành công, giỏ sẽ được xóa — không redirect về "/" vì giỏ rỗng. */
  const [orderCompleted, setOrderCompleted] = useState(false);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  useEffect(() => {
    setMounted(true);
    const storedUser = readAuthUser();

    if (items.length === 0 && !orderCompleted) {
      router.replace("/");
      return;
    }

    if (storedUser?.name?.trim()) {
      setCustomerName(storedUser.name.trim());
    }
  }, [items.length, router, orderCompleted]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const currentUser = readAuthUser();
    if (!currentUser?.id) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      router.replace("/login");
      return;
    }

    if (!customerName.trim() || !customerAddress.trim()) {
      setError("Vui lòng nhập đầy đủ họ tên và địa chỉ giao hàng.");
      return;
    }

    const phoneDigits = normalizeDigitsPhoneInput(customerPhone);
    if (!isValidVnPhone09(phoneDigits)) {
      setError(
        "Số điện thoại bắt buộc: 10 chữ số, bắt đầu bằng 09 (chỉ nhập số, ví dụ 0912345678)."
      );
      return;
    }

    if (items.length === 0) {
      setError("Giỏ hàng đang trống.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          customerName: customerName.trim(),
          customerAddress: customerAddress.trim(),
          customerPhone: phoneDigits,
          cartItems: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const result = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Gửi đơn hàng thất bại.");
      }

      setOrderCompleted(true);
      setMessage("Đặt hàng thành công");
      setTimeout(() => {
        clearCart();
      }, 0);

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể gửi đơn hàng, vui lòng thử lại sau."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return <main className="mx-auto max-w-6xl p-4">Đang tải...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Thanh toán</h1>

      {message && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 rounded-lg border-2 border-green-300 bg-green-50 px-4 py-4 text-center shadow-md"
        >
          <p className="text-lg font-semibold text-green-800">{message}</p>
          <p className="mt-1 text-sm text-green-700">
            Đang chuyển về trang chủ sau vài giây…
          </p>
        </div>
      )}
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-black">
            Thông tin giao hàng
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="customerName"
                className="mb-1 block text-sm font-medium text-black"
              >
                Họ tên *
              </label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-black placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
                placeholder="Nguyen Van A"
                required
              />
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="mb-1 block text-sm font-medium text-black"
              >
                Số điện thoại *
              </label>
              <input
                id="customerPhone"
                type="text"
                inputMode="numeric"
                autoComplete="tel"
                pattern="09[0-9]{8}"
                title="10 chữ số, bắt đầu 09"
                value={customerPhone}
                onChange={(e) =>
                  setCustomerPhone(normalizeDigitsPhoneInput(e.target.value))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-black placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
                placeholder="0912345678"
                required
                maxLength={10}
              />
            </div>

            <div>
              <label
                htmlFor="customerAddress"
                className="mb-1 block text-sm font-medium text-black"
              >
                Địa chỉ giao hàng *
              </label>
              <textarea
                id="customerAddress"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="min-h-[110px] w-full rounded-md border border-gray-300 px-3 py-2 text-black placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang gửi đơn..." : "Xác nhận đặt hàng"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-black">
            Đơn hàng của bạn
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Giỏ hàng trống.</p>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border border-gray-100 p-3 text-sm"
                  >
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-gray-600">
                      SL: {item.quantity} x {item.price.toLocaleString("vi-VN")} đ
                    </p>
                    <p className="mt-1 font-semibold text-indigo-600">
                      {(item.quantity * item.price).toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-base font-semibold text-black">
                  <span>Tổng cộng</span>
                  <span>{total.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutContent />
    </AuthGuard>
  );
}
