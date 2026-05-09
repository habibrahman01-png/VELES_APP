"use client";

import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, useCartTotal } from "@/store/cart-store";

export function CartClient() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const total = useCartTotal();

  if (!items.length) {
    return (
      <Card className="p-8">
        <p className="text-sub">Your cart is empty.</p>
        <p className="mt-3 text-body text-bodyGray">Add pieces from the latest VELES collection to continue.</p>
        <div className="mt-6">
          <ButtonLink href="/store">Go To Shop</ButtonLink>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr,0.8fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <Card className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between" key={`${item.productId}-${item.size}`}>
            <div className="flex items-center gap-4">
              <div className="relative h-28 w-24 overflow-hidden rounded-[20px] bg-chipGray">
                <Image alt={item.productName} className="object-cover" fill src={item.imageUrl || "/placeholder.svg"} />
              </div>
              <div className="space-y-1">
                <Link className="text-small" href={`/shop/${item.slug}`}>
                  {item.productName}
                </Link>
                <p className="text-caption text-bodyGray">Size {item.size}</p>
                <p className="text-body">{formatCurrency(item.priceAtPurchase)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <QuantityStepper onChange={(value) => updateQuantity(item.productId, item.size, value)} value={item.quantity} />
              <button className="text-caption text-bodyGray underline" onClick={() => removeItem(item.productId, item.size)} type="button">
                Remove
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="h-fit space-y-4 p-6">
        <div className="flex items-center justify-between">
          <span className="text-body text-bodyGray">Subtotal</span>
          <span className="text-small">{formatCurrency(total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body text-bodyGray">Shipping</span>
          <span className="text-body">Calculated at checkout</span>
        </div>
        <div className="border-t border-chipGray pt-4">
          <div className="flex items-center justify-between">
            <span className="text-small">Estimated total</span>
            <span className="text-sub">{formatCurrency(total)}</span>
          </div>
        </div>
        <ButtonLink className="w-full" href="/checkout">
          Proceed To Checkout
        </ButtonLink>
      </Card>
    </div>
  );
}
