import { LiveStorePage } from "@/components/store/live-store-page";

interface StorePageProps {
  searchParams: {
    category?: string;
    productType?: string;
    sort?: "price-asc" | "price-desc" | "latest";
    q?: string;
  };
}

export default async function StorePage({ searchParams }: StorePageProps) {
  return <LiveStorePage searchParams={searchParams} />;
}
