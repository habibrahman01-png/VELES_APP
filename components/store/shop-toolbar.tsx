"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORIES, MATERIAL_FILTERS } from "@/lib/constants";

export function ShopToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "";
  const activeMaterial = searchParams.get("material") || "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function updateCategory(category: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function updateMaterial(material: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!material) {
      params.delete("material");
      router.push(`${pathname}?${params.toString()}`);
      return;
    }

    params.set("material", material);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Category</label>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((category) => (
            <Chip active={activeCategory === category} key={category} onClick={() => updateCategory(category)} type="button">
              {category}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Material</label>
        <div className="flex flex-wrap gap-3">
          <Chip active={!activeMaterial} onClick={() => updateMaterial("")} type="button">
            All Materials
          </Chip>
          {MATERIAL_FILTERS.map((material) => (
            <Chip active={activeMaterial === material} key={material} onClick={() => updateMaterial(material)} type="button">
              {material}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Search</label>
          <Input
            defaultValue={searchParams.get("q") || ""}
            onChange={(event) => updateParam("q", event.target.value)}
            placeholder="Search products"
          />
        </div>
        <div className="space-y-2">
          <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Sort</label>
          <Select defaultValue={searchParams.get("sort") || "latest"} onChange={(event) => updateParam("sort", event.target.value)}>
            <option value="latest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
