"use client";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, PRODUCT_TYPES, SIZES } from "@/lib/constants";
import { getFirebaseClientSetupError, storage } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product | null;
}

type VariantFormState = Record<string, number>;

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [variantState, setVariantState] = useState<VariantFormState>(() =>
    Object.fromEntries(SIZES.map((size) => [size, product?.variants?.find((variant) => variant.size === size)?.stock || 0]))
  );

  const productId = useMemo(() => product?.id || crypto.randomUUID(), [product?.id]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    if (!storage) {
      setMessage(getFirebaseClientSetupError());
      return;
    }

    const files = event.target.files;
    if (!files?.length) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const path = `products/${productId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      uploadedUrls.push(url);
    }

    setImages((current) => [...current, ...uploadedUrls]);
    setUploading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      id: productId,
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || ""),
      description: String(formData.get("description") || ""),
      category: String(formData.get("category") || ""),
      productType: String(formData.get("productType") || ""),
      price: Number(formData.get("price") || 0),
      compareAtPrice: Number(formData.get("compareAtPrice") || 0) || null,
      images,
      isActive: formData.get("isActive") === "on",
      variants: SIZES.map((size) => ({
        size,
        stock: Number(variantState[size] || 0)
      }))
    };

    const response = await fetch(mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to save product.");
      setSaving(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <Card className="p-6">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Product Name</label>
            <Input
              name="name"
              onChange={(event) => {
                setName(event.target.value);
                if (mode === "create" || !slug) {
                  setSlug(slugify(event.target.value));
                }
              }}
              required
              value={name}
            />
          </div>
          <div className="space-y-2">
            <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Slug</label>
            <Input name="slug" onChange={(event) => setSlug(event.target.value)} required value={slug} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Description</label>
          <Textarea defaultValue={product?.description || ""} name="description" required />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Category</label>
            <Select defaultValue={product?.category || CATEGORIES[0]} name="category">
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Product Type</label>
            <Select defaultValue={product?.productType || PRODUCT_TYPES[0]} name="productType">
              {PRODUCT_TYPES.map((productType) => (
                <option key={productType} value={productType}>
                  {productType}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Price</label>
            <Input defaultValue={product?.price || ""} min="0" name="price" required step="0.01" type="number" />
          </div>
          <div className="space-y-2">
            <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Compare-at Price</label>
            <Input defaultValue={product?.compareAtPrice || ""} min="0" name="compareAtPrice" step="0.01" type="number" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Images</label>
          <Input accept="image/*" multiple onChange={handleUpload} type="file" />
          {uploading ? <p className="text-caption text-bodyGray">Uploading images...</p> : null}
          <div className="grid gap-3 md:grid-cols-3">
            {images.map((image) => (
              <div className="truncate rounded-[20px] border border-chipGray px-4 py-3 text-caption text-bodyGray" key={image}>
                {image}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Size Inventory</label>
            <label className="flex items-center gap-3 text-caption text-bodyGray">
              <input defaultChecked={product?.isActive ?? true} name="isActive" type="checkbox" />
              Active product
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {SIZES.map((size) => (
              <div className="space-y-2" key={size}>
                <label className="text-caption text-bodyGray">{size}</label>
                <Input
                  min="0"
                  onChange={(event) =>
                    setVariantState((current) => ({
                      ...current,
                      [size]: Number(event.target.value)
                    }))
                  }
                  type="number"
                  value={variantState[size]}
                />
              </div>
            ))}
          </div>
        </div>

        {message ? <p className="text-caption text-bodyGray">{message}</p> : null}

        <Button disabled={saving || uploading} type="submit">
          {saving ? "Saving" : mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
      </form>
    </Card>
  );
}
