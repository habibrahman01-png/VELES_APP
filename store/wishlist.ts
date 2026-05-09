"use client";

import { create } from "zustand";

import { WishlistItem } from "@/lib/types";

interface WishlistState {
  items: WishlistItem[];
  toastMessage: string;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  setItems: (items: WishlistItem[]) => void;
  clearItems: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

function dedupeItems(items: WishlistItem[]) {
  return items.filter((item, index, array) => array.findIndex((entry) => entry.productId === item.productId) === index);
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  toastMessage: "",
  addItem: (item) =>
    set((state) => {
      if (state.items.some((entry) => entry.productId === item.productId)) {
        return state;
      }

      return { items: [item, ...state.items] };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId)
    })),
  toggleItem: (item) =>
    set((state) => ({
      items: state.items.some((entry) => entry.productId === item.productId)
        ? state.items.filter((entry) => entry.productId !== item.productId)
        : [item, ...state.items]
    })),
  isWishlisted: (productId) => get().items.some((item) => item.productId === productId),
  setItems: (items) => set({ items: dedupeItems(items) }),
  clearItems: () => set({ items: [] }),
  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: "" })
}));

export function useWishlistCount() {
  return useWishlistStore((state) => state.items.length);
}
