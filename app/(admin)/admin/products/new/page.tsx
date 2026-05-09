import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Inventory</p>
        <h1 className="text-section">Add Product</h1>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
