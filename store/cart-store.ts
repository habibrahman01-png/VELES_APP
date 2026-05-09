"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CartItem } from "@/lib/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((entry) => entry.productId === item.productId && entry.size === item.size);
          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.productId === item.productId && entry.size === item.size
                  ? { ...entry, quantity: entry.quantity + item.quantity }
                  : entry
              )
            };
          }

          return { items: [...state.items, item] };
        }),
      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter((item) => !(item.productId === productId && item.size === size))
        })),
      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.productId === productId && item.size === size ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0)
        })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: "veles-cart"
    }
  )
);

export function useCartCount() {
  return useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
}

export function useCartTotal() {
  return useCartStore((state) => state.items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0));
}
