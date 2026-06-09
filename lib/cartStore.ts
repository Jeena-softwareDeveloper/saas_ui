import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "./types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  coupon: { code: string; discount_amount: number; coupon_id: string } | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  setCoupon: (coupon: { code: string; discount_amount: number; coupon_id: string }) => void;
  removeCoupon: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const stockVal = typeof product.stock !== "undefined" ? product.stock : (product as any).stockQuantity ?? 0;
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, stockVal) }
                  : i
              ),
              isOpen: true,
            };
          }
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              images: product.images,
              stock: stockVal,
              slug: product.slug,
            },
            quantity: Math.min(quantity, stockVal),
          };
          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], coupon: null }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      closeCart: () => set({ isOpen: false }),

      setCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

      total: () =>
        get().items.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        ),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "shopnest-cart",
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
);
