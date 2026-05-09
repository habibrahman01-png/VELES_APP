"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Product } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";

interface AddToCartFormProps {
  product: Product;
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState<string>(product.variants?.find((variant) => variant.stock > 0)?.size || "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const activeVariant = useMemo(
    () => product.variants?.find((variant) => variant.size === selectedSize),
    [product.variants, selectedSize]
  );

  const maxQuantity = activeVariant?.stock || 1;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Select Size</p>
        <div className="flex flex-wrap gap-3">
          {product.variants?.map((variant) => (
            <Chip
              active={selectedSize === variant.size}
              disabled={variant.stock === 0}
              key={variant.id}
              onClick={() => setSelectedSize(variant.size)}
              type="button"
            >
              {variant.size}
            </Chip>
          ))}
        </div>
        {activeVariant && activeVariant.stock < 5 ? <p className="text-caption text-bodyGray">Only {activeVariant.stock} left</p> : null}
      </div>

      <div className="space-y-3">
        <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Quantity</p>
        <QuantityStepper max={maxQuantity} onChange={setQuantity} value={quantity} />
      </div>

      <Button
        disabled={!activeVariant || !selectedSize}
        fullWidth
        onClick={() => {
          if (!activeVariant) {
            setMessage("Select an available size.");
            return;
          }

          addItem({
            productId: product.id,
            productName: product.name,
            productType: product.productType,
            category: product.category,
            imageUrl: product.images[0] || "",
            size: activeVariant.size,
            quantity,
            priceAtPurchase: product.price,
            slug: product.slug
          });
          setMessage("Added to cart.");
        }}
        type="button"
      >
        Add To Cart
      </Button>

      {message ? <p className="text-caption text-bodyGray">{message}</p> : null}
    </div>
  );
}
