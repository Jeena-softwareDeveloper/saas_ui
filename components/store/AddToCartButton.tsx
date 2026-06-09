"use client";

import { useCartStore } from "@/lib/cartStore";

export default function AddToCartButton({ product }: { product: any }) {
  const { addItem } = useCartStore();

  return (
    <button
      className="btn-primary w-full mt-3 justify-center text-xs py-2"
      onClick={(e) => {
        e.preventDefault();
        addItem(product, 1);
      }}
    >
      Add to Cart
    </button>
  );
}
