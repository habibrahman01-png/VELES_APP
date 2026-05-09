import { redirect } from "next/navigation";

interface ShopPageProps {
  searchParams: {
    category?: string;
    material?: string;
    sort?: string;
    q?: string;
  };
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  const params = new URLSearchParams();

  if (searchParams.category) {
    params.set("category", searchParams.category);
  }

  if (searchParams.material) {
    params.set("productType", searchParams.material);
  }

  if (searchParams.sort) {
    params.set("sort", searchParams.sort);
  }

  if (searchParams.q) {
    params.set("q", searchParams.q);
  }

  redirect(params.toString() ? `/store?${params.toString()}` : "/store");
}
