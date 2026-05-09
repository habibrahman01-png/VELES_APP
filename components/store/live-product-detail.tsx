"use client";

import Image from "next/image";
import { collection, documentId, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { AddToCartForm } from "@/components/store/add-to-cart-form";
import { WishlistToggle } from "@/components/store/wishlist-toggle";
import { Card } from "@/components/ui/card";
import { db, getFirebaseClientSetupError } from "@/lib/firebase";
import { Product, ProductVariant } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface LiveProductDetailProps {
  slug: string;
  initialProduct: Product;
}

export function LiveProductDetail({ slug, initialProduct }: LiveProductDetailProps) {
  const [baseProduct, setBaseProduct] = useState<Omit<Product, "variants"> | null>(() => {
    const { variants: _variants, ...product } = initialProduct;
    return product;
  });
  const [variants, setVariants] = useState<ProductVariant[]>(initialProduct.variants || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db) {
      setError(getFirebaseClientSetupError());
      return;
    }

    let unsubscribeVariants: (() => void) | undefined;

    const unsubscribeProduct = onSnapshot(
      query(collection(db, "products"), where("slug", "==", slug), where("isDeleted", "==", false), where("isActive", "==", true)),
      (snapshot) => {
        unsubscribeVariants?.();

        if (snapshot.empty) {
          setBaseProduct(null);
          setVariants([]);
          setLoading(false);
          return;
        }

        const productDoc = snapshot.docs[0];
        setBaseProduct({
          id: productDoc.id,
          ...(productDoc.data() as Omit<Product, "id" | "variants">)
        });
        setLoading(false);

        unsubscribeVariants = onSnapshot(
          query(collection(productDoc.ref, "variants"), orderBy(documentId())),
          (variantSnapshot) => {
            setVariants(
              variantSnapshot.docs.map((item) => ({
                id: item.id,
                ...(item.data() as Omit<ProductVariant, "id">)
              }))
            );
          },
          () => {
            setError("Unable to load product inventory in real time.");
          }
        );
      },
      () => {
        setError("Unable to load this product in real time.");
        setLoading(false);
      }
    );

    return () => {
      unsubscribeProduct();
      unsubscribeVariants?.();
    };
  }, [slug]);

  const product = useMemo(() => {
    if (!baseProduct) {
      return null;
    }

    return {
      ...baseProduct,
      variants
    } satisfies Product;
  }, [baseProduct, variants]);

  if (error) {
    return (
      <div className="layout-shell py-12">
        <Card className="p-6 text-body text-bodyGray">{error}</Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="layout-shell py-12">
        <Card className="p-6 text-body text-bodyGray">Loading product...</Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="layout-shell py-12">
        <Card className="p-6 text-body text-bodyGray">This product is no longer available.</Card>
      </div>
    );
  }

  return (
    <div className="layout-shell grid gap-8 py-12 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="grid gap-4 md:grid-cols-2">
        {product.images.map((image, index) => (
          <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-chipGray" key={`${image}-${index}`}>
            <Image alt={`${product.name} ${index + 1}`} className="object-cover" fill src={image || "/placeholder.svg"} />
          </div>
        ))}
      </div>

      <Card className="h-fit space-y-6 p-8">
        <div className="space-y-3">
          <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">{product.category}</p>
          <p className="text-caption text-bodyGray">{product.productType}</p>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-card">{product.name}</h1>
            <WishlistToggle
              className="shrink-0 opacity-100"
              item={{
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.images[0] || "/placeholder.svg",
                slug: product.slug
              }}
              tone="detail"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sub">{formatCurrency(product.price)}</span>
            {product.compareAtPrice ? <span className="text-body text-mutedGray line-through">{formatCurrency(product.compareAtPrice)}</span> : null}
          </div>
        </div>

        <p className="text-body text-bodyGray">{product.description}</p>

        <AddToCartForm
          key={`${product.id}-${product.variants?.map((variant) => `${variant.size}:${variant.stock}`).join("|") || "no-variants"}`}
          product={product}
        />
      </Card>
    </div>
  );
}
