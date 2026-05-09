"use client";

import Image from "next/image";
import Link from "next/link";
import { deleteDoc, doc } from "firebase/firestore";
import { useState } from "react";

import { WishlistToggle } from "@/components/store/wishlist-toggle";
import { db } from "@/lib/firebase";
import { WishlistItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist";

interface WishlistProductCardProps {
  item: WishlistItem;
}

const buttonBaseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full border border-chipGray px-4 py-3 text-body font-medium transition duration-200";

export function WishlistProductCard({ item }: WishlistProductCardProps) {
  const removeItem = useWishlistStore((state) => state.removeItem);
  const setItems = useWishlistStore((state) => state.setItems);
  const showToast = useWishlistStore((state) => state.showToast);
  const items = useWishlistStore((state) => state.items);
  const user = useAuthStore((state) => state.user);
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (removing) {
      return;
    }

    const previousItems = items;
    removeItem(item.productId);

    if (!user || !db) {
      showToast("Sign in to save your wishlist permanently.");
      return;
    }

    setRemoving(true);

    try {
      await deleteDoc(doc(db, "users", user.uid, "wishlist", item.productId));
    } catch (error) {
      console.error("Unable to remove the wishlist item.", error);
      setItems(previousItems);
      showToast("Unable to update wishlist.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="group rounded-[28px] border border-chipGray bg-pureWhite p-3 transition hover:-translate-y-1 hover:shadow-floating">
      <div className="relative">
        <Link className="block overflow-hidden rounded-[20px] bg-chipGray" href={`/shop/${item.slug}`}>
          <div className="relative aspect-[3/4]">
            <Image alt={item.name} className="object-cover transition duration-300 group-hover:scale-[1.02]" fill src={item.imageUrl || "/placeholder.svg"} />
          </div>
        </Link>
        <div className="absolute right-4 top-4">
          <WishlistToggle className="opacity-100" item={item} />
        </div>
      </div>
      <div className="space-y-3 px-1 pt-4">
        <div className="space-y-1">
          <Link className="text-small" href={`/shop/${item.slug}`}>
            {item.name}
          </Link>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-3">
            <button
              className="rounded-full border border-chipGray bg-chipGray px-4 py-2 text-caption transition hover:bg-hoverGray"
              disabled={removing}
              onClick={handleRemove}
              type="button"
            >
              Remove
            </button>
            <span className="block text-body">{formatCurrency(item.price)}</span>
          </div>
          <Link className={`${buttonBaseStyles} bg-pureWhite px-3 py-2 text-caption text-uberBlack hover:bg-hoverLight`} href={`/shop/${item.slug}`}>
            Quick Add
          </Link>
        </div>
      </div>
    </div>
  );
}
