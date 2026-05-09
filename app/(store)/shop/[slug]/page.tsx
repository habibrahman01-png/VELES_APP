import { notFound } from "next/navigation";

import { LiveProductDetail } from "@/components/store/live-product-detail";
import { getProductBySlug } from "@/lib/data";

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return <LiveProductDetail initialProduct={product} slug={params.slug} />;
}
