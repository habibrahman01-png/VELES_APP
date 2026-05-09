import Image from "next/image";
import Link from "next/link";

import { ProductDeleteButton } from "@/components/admin/product-delete-button";
import { ProductStatusToggle } from "@/components/admin/product-status-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllProducts } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Inventory</p>
          <h1 className="text-section">Products</h1>
        </div>
        <ButtonLink href="/admin/products/new">Add Product</ButtonLink>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-chipGray text-caption uppercase tracking-[0.15em] text-mutedGray">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr className="border-b border-chipGray last:border-b-0" key={product.id}>
                  <td className="px-6 py-4">
                    <div className="relative h-14 w-12 overflow-hidden rounded-2xl bg-chipGray">
                      <Image alt={product.name} className="object-cover" fill src={product.images[0] || "/placeholder.svg"} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body">{product.name}</td>
                  <td className="px-6 py-4 text-body text-bodyGray">{product.category}</td>
                  <td className="px-6 py-4 text-body">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 text-body">
                    <ProductStatusToggle currentValue={product.isActive} productId={product.id} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-caption">
                      <Link className="underline" href={`/admin/products/${product.id}/edit`}>
                        Edit
                      </Link>
                      <ProductDeleteButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
