import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Một dòng trong giỏ: sản phẩm + số lượng. */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

/** Payload khi thêm sản phẩm (chưa có quantity — mặc định 1). */
export interface CartProductInput {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
}

export interface CartStore {
  items: CartItem[];
  addItem: (product: CartProductInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

/**
 * localStorage chỉ tồn tại trên trình duyệt; tránh lỗi khi bundle chạy phía server (SSR).
 */
function getCartStorage() {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const imageUrl =
          product.imageUrl === null || product.imageUrl === undefined
            ? undefined
            : product.imageUrl;

        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          const newItem: CartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            ...(imageUrl !== undefined ? { imageUrl } : {}),
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "next14-shop-cart",
      /** Chỉ lưu danh sách item; các hàm không serialize được. */
      partialize: (state) => ({ items: state.items }),
      storage: createJSONStorage(getCartStorage),
    }
  )
);
