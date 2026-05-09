"use client";

import { collection, collectionGroup, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { ShopGrid } from "@/components/store/shop-grid";
import { StoreFilters } from "@/components/store/store-filters";
import { Card } from "@/components/ui/card";
import { SIZES } from "@/lib/constants";
import { db, getFirebaseClientSetupError } from "@/lib/firebase";
import { MaterialFilter, Product, ProductType, ProductVariant } from "@/lib/types";

interface LiveStorePageProps {
  searchParams: {
    category?: string;
    productType?: string;
    sort?: "price-asc" | "price-desc" | "latest";
    q?: string;
  };
}

function getMaterialProductTypes(material?: MaterialFilter, category?: string): ProductType[] {
  if (!material) {
    return [];
  }

  const isAccessories = category === "Accessories";

  if (material === "Genuine Leather") {
    return [isAccessories ? "Leather Purse" : "Genuine Leather Jacket"];
  }

  if (material === "Non-Leather") {
    return [isAccessories ? "Non-Leather Purse" : "Non-Leather Jacket"];
  }

  return [isAccessories ? "Plant-Based Leather Purse" : "Plant-Based Leather Jacket"];
}

function toTimestamp(value: Product["createdAt"]) {
  if (typeof value === "string" || value instanceof Date) {
    return new Date(value).getTime();
  }

  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  return 0;
}

export function LiveStorePage({ searchParams }: LiveStorePageProps) {
  const [baseProducts, setBaseProducts] = useState<Record<string, Omit<Product, "variants">>>({});
  const [variantsByProductId, setVariantsByProductId] = useState<Record<string, ProductVariant[]>>({});
  const [productsReady, setProductsReady] = useState(false);
  const [variantsReady, setVariantsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db) {
      setError(getFirebaseClientSetupError());
      setProductsReady(true);
      setVariantsReady(true);
      return undefined;
    }

    const unsubscribeProducts = onSnapshot(
      query(collection(db, "products"), where("isActive", "==", true), where("isDeleted", "==", false)),
      (snapshot) => {
        const nextProducts = snapshot.docs.reduce<Record<string, Omit<Product, "variants">>>((accumulator, item) => {
          accumulator[item.id] = {
            id: item.id,
            ...(item.data() as Omit<Product, "id" | "variants">)
          };
          return accumulator;
        }, {});

        setBaseProducts(nextProducts);
        setProductsReady(true);
      },
      () => {
        setError("Unable to load products in real time.");
        setProductsReady(true);
      }
    );

    const unsubscribeVariants = onSnapshot(
      collectionGroup(db, "variants"),
      (snapshot) => {
        const nextVariants = snapshot.docs.reduce<Record<string, ProductVariant[]>>((accumulator, item) => {
          const productId = item.ref.parent.parent?.id;

          if (!productId) {
            return accumulator;
          }

          if (!accumulator[productId]) {
            accumulator[productId] = [];
          }

          accumulator[productId].push({
            id: item.id,
            ...(item.data() as Omit<ProductVariant, "id">)
          });

          return accumulator;
        }, {});

        Object.values(nextVariants).forEach((variants) => {
          variants.sort((left, right) => SIZES.indexOf(left.size) - SIZES.indexOf(right.size));
        });

        setVariantsByProductId(nextVariants);
        setVariantsReady(true);
      },
      () => {
        setError("Unable to load product inventory in real time.");
        setVariantsReady(true);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeVariants();
    };
  }, []);

  const products = useMemo(() => {
    return Object.values(baseProducts).map((product) => ({
      ...product,
      variants: variantsByProductId[product.id] || []
    }));
  }, [baseProducts, variantsByProductId]);

  const filteredProducts = useMemo(() => {
    const selectedProductTypes = searchParams.category
      ? getMaterialProductTypes(searchParams.productType as MaterialFilter | undefined, searchParams.category)
      : searchParams.productType
        ? [
            ...getMaterialProductTypes(searchParams.productType as MaterialFilter, "Men"),
            ...getMaterialProductTypes(searchParams.productType as MaterialFilter, "Accessories")
          ]
        : [];

    const searchTerm = searchParams.q?.trim().toLowerCase();

    const nextProducts = products.filter((product) => {
      if (searchParams.category && product.category !== searchParams.category) {
        return false;
      }

      if (selectedProductTypes.length > 0 && !selectedProductTypes.includes(product.productType)) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      const haystack = [product.name, product.description, product.category, product.productType, product.slug].join(" ").toLowerCase();
      return haystack.includes(searchTerm);
    });

    return [...nextProducts].sort((left, right) => {
      if (searchParams.sort === "price-asc") {
        return left.price - right.price;
      }

      if (searchParams.sort === "price-desc") {
        return right.price - left.price;
      }

      return toTimestamp(right.createdAt) - toTimestamp(left.createdAt);
    });
  }, [products, searchParams.category, searchParams.productType, searchParams.q, searchParams.sort]);

  const isLoading = !productsReady || !variantsReady;

  return (
    <div className="layout-shell space-y-8 py-12">
      <div className="space-y-3">
        <h1 className="text-section">Our Collection</h1>
        <p className="max-w-3xl text-body text-bodyGray">
          Explore premium genuine leather, non-leather, and plant-based leather jackets for men and women, along with refined leather
          purses and accessories crafted with the same elevated finish.
        </p>
        {searchParams.q ? (
          <p className="text-caption text-bodyGray">
            Showing {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"} for "{searchParams.q}".
          </p>
        ) : null}
      </div>

      <Card className="p-6">
        <StoreFilters />
      </Card>

      {error ? <Card className="p-6 text-body text-bodyGray">{error}</Card> : null}

      {isLoading ? (
        <Card className="p-6 text-body text-bodyGray">Loading products...</Card>
      ) : filteredProducts.length ? (
        <ShopGrid products={filteredProducts} showSizeFilters={false} />
      ) : (
        <Card className="p-6 text-body text-bodyGray">No products match the selected filters right now.</Card>
      )}
    </div>
  );
}
