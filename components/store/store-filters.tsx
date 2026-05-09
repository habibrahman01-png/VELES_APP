"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Chip } from "@/components/ui/chip";
import { Select } from "@/components/ui/select";
import { CATEGORIES, MATERIAL_FILTERS } from "@/lib/constants";

export function StoreFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  const activeType = searchParams.get("productType") || "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function toggleParam(key: string, value: string, activeValue: string) {
    updateParam(key, activeValue === value ? "" : value);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Gender / Category</p>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <Chip active={activeCategory === category} key={category} onClick={() => toggleParam("category", category, activeCategory)} type="button">
                {category}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Product Type</p>
          <div className="flex flex-wrap gap-3">
            {MATERIAL_FILTERS.map((productType) => (
              <Chip active={activeType === productType} key={productType} onClick={() => toggleParam("productType", productType, activeType)} type="button">
                {productType}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:max-w-xs">
        <div className="space-y-2">
          <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Sort</label>
          <Select onChange={(event) => updateParam("sort", event.target.value)} value={searchParams.get("sort") || "latest"}>
            <option value="latest">Newest</option>
            <option value="price-asc">Price: Low-High</option>
            <option value="price-desc">Price: High-Low</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
