"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/store/product-card";
import { Chip } from "@/components/ui/chip";
import { SIZES } from "@/lib/constants";
import { Product } from "@/lib/types";

interface ShopGridProps {
  products: Product[];
  showSizeFilters?: boolean;
}

export function ShopGrid({ products, showSizeFilters = true }: ShopGridProps) {
  const [selectedSize, setSelectedSize] = useState<string>("ALL");

  const filtered = useMemo(() => {
    if (selectedSize === "ALL") {
      return products;
    }

    return products.filter((product) => product.variants?.some((variant) => variant.size === selectedSize && variant.stock > 0));
  }, [products, selectedSize]);

  return (
    <div className="space-y-6">
      {showSizeFilters ? (
        <div className="flex flex-wrap gap-3">
          <Chip active={selectedSize === "ALL"} onClick={() => setSelectedSize("ALL")} type="button">
            All Sizes
          </Chip>
          {SIZES.map((size) => (
            <Chip active={selectedSize === size} key={size} onClick={() => setSelectedSize(size)} type="button">
              {size}
            </Chip>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
