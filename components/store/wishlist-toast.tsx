"use client";

import { useEffect } from "react";

import { useWishlistStore } from "@/store/wishlist";

export function WishlistToast() {
  const toastMessage = useWishlistStore((state) => state.toastMessage);
  const clearToast = useWishlistStore((state) => state.clearToast);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      clearToast();
    }, 2400);

    return () => window.clearTimeout(timeout);
  }, [clearToast, toastMessage]);

  if (!toastMessage) {
    return null;
  }

  return <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-uberBlack px-4 py-3 text-caption text-pureWhite shadow-floating">{toastMessage}</div>;
}
