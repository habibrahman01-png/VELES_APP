"use client";

import Link from "next/link";

import { WishlistProductCard } from "@/components/store/wishlist-product-card";
import { useWishlistStore } from "@/store/wishlist";

const buttonBaseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full border border-chipGray px-4 py-3 text-body font-medium transition duration-200";

export function WishlistPage() {
  const items = useWishlistStore((state) => state.items);

  return (
    <div className="layout-shell space-y-8 py-12">
      <div className="space-y-3">
        <h1 className="text-section">My Wishlist</h1>
      </div>

      {items.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <WishlistProductCard item={item} key={item.productId} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-sub">Your wishlist is empty</h2>
          <p className="max-w-md text-body text-bodyGray">Save the pieces you love here, then come back anytime to continue shopping.</p>
          <Link className={`${buttonBaseStyles} bg-uberBlack text-pureWhite hover:bg-[#111111]`} href="/store">
            Browse Collection
          </Link>
        </div>
      )}
    </div>
  );
}
