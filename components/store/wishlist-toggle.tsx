"use client";

import { MouseEvent, useState } from "react";
import { Heart } from "lucide-react";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { WishlistItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist";

interface WishlistToggleProps {
  item: WishlistItem;
  className?: string;
  revealOnHover?: boolean;
  tone?: "image" | "detail";
}

export function WishlistToggle({ item, className, revealOnHover = false, tone = "image" }: WishlistToggleProps) {
  const user = useAuthStore((state) => state.user);
  const [saving, setSaving] = useState(false);
  const wishlistStore = useWishlistStore();
  const isWishlisted = wishlistStore.isWishlisted(item.productId);

  async function handleToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (saving) {
      return;
    }

    const previousItems = wishlistStore.items;
    const nextItem = {
      ...item,
      addedAt: item.addedAt || new Date().toISOString()
    };

    wishlistStore.toggleItem(nextItem);
    if (!user || !db) {
      wishlistStore.showToast("Sign in to save your wishlist permanently.");
      return;
    }

    setSaving(true);

    try {
      const wishlistRef = doc(db, "users", user.uid, "wishlist", item.productId);

      if (isWishlisted) {
        await deleteDoc(wishlistRef);
      } else {
        await setDoc(wishlistRef, {
          productId: item.productId,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          slug: item.slug,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Unable to update the wishlist.", error);
      wishlistStore.setItems(previousItems);
      wishlistStore.showToast("Unable to update wishlist.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "inline-flex rounded-full p-2 transition",
        revealOnHover && "opacity-0 group-hover:opacity-100",
        className
      )}
      onClick={handleToggle}
      type="button"
    >
      <Heart
        className={cn(
          "h-5 w-5",
          tone === "image" && !isWishlisted && "text-pureWhite drop-shadow",
          tone === "image" && isWishlisted && "fill-uberBlack text-uberBlack drop-shadow",
          tone === "detail" && !isWishlisted && "text-uberBlack",
          tone === "detail" && isWishlisted && "fill-uberBlack text-uberBlack"
        )}
      />
    </button>
  );
}
