"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";

import { Input } from "@/components/ui/input";
import { NAV_LINKS } from "@/lib/constants";
import { useAuthStore } from "@/store/auth-store";
import { useCartCount } from "@/store/cart-store";
import { useWishlistCount } from "@/store/wishlist";

export function SiteHeader() {
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const role = useAuthStore((state) => state.role);

  return (
    <header className="sticky top-0 z-40 border-b border-chipGray bg-pureWhite/95 backdrop-blur">
      <div className="layout-shell flex h-20 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link className="text-nav font-semibold tracking-[0.3em]" href="/">
            VELES
          </Link>
          <nav className="hidden items-center gap-6 text-body text-bodyGray md:flex">
            {NAV_LINKS.map((link) => (
              <Link className="transition hover:text-uberBlack" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <form action="/store" className="hidden max-w-sm flex-1 items-center gap-2 rounded-full border border-chipGray px-4 md:flex">
          <Search className="h-4 w-4 text-mutedGray" />
          <Input className="border-0 px-0 focus:border-0" name="q" placeholder="Search VELES" />
        </form>

        <div className="flex items-center gap-3">
          {role === "ADMIN" ? (
            <Link className="hidden text-caption text-bodyGray transition hover:text-uberBlack md:inline-flex" href="/admin">
              Admin Dashboard
            </Link>
          ) : null}
          <Link className="rounded-full p-3 transition hover:bg-hoverLight" href="/account">
            <User className="h-5 w-5" />
          </Link>
          <Link className="relative rounded-full p-3 transition hover:bg-hoverLight" href="/wishlist">
            <Heart className="h-5 w-5" />
            {wishlistCount ? (
              <span className="absolute right-1 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-uberBlack px-1 text-micro text-pureWhite">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
          <Link className="relative rounded-full p-3 transition hover:bg-hoverLight" href="/cart">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute right-1 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-uberBlack px-1 text-micro text-pureWhite">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
