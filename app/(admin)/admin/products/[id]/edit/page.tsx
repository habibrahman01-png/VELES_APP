import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { getProductById } from "@/lib/data";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Inventory</p>
        <h1 className="text-section">Edit Product</h1>
      </div>
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
