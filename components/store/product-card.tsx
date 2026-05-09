import Image from "next/image";
import Link from "next/link";

import { WishlistToggle } from "@/components/store/wishlist-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group rounded-[28px] border border-chipGray bg-pureWhite p-3 transition hover:-translate-y-1 hover:shadow-floating">
      <div className="relative">
        <Link className="block overflow-hidden rounded-[20px] bg-chipGray" href={`/shop/${product.slug}`}>
          <div className="relative aspect-[3/4]">
            <Image alt={product.name} className="object-cover transition duration-300 group-hover:scale-[1.02]" fill src={product.images[0] || "/placeholder.svg"} />
          </div>
        </Link>
        <div className="absolute right-4 top-4">
          <WishlistToggle
            item={{
              productId: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.images[0] || "/placeholder.svg",
              slug: product.slug
            }}
            revealOnHover
          />
        </div>
      </div>
      <div className="space-y-3 px-1 pt-4">
        <div className="space-y-1">
          <p className="text-caption uppercase tracking-[0.15em] text-mutedGray">{product.category}</p>
          <p className="text-caption text-bodyGray">{product.productType}</p>
          <Link className="text-small" href={`/shop/${product.slug}`}>
            {product.name}
          </Link>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-body">{formatCurrency(product.price)}</span>
            {product.compareAtPrice ? <span className="text-caption text-mutedGray line-through">{formatCurrency(product.compareAtPrice)}</span> : null}
          </div>
          <div className="opacity-0 transition group-hover:opacity-100">
            <ButtonLink className="px-3 py-2 text-caption" href={`/shop/${product.slug}`} variant="secondary">
              Quick Add
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
