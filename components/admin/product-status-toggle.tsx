"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductStatusToggleProps {
  productId: string;
  currentValue: boolean;
}

export function ProductStatusToggle({ productId, currentValue }: ProductStatusToggleProps) {
  const router = useRouter();
  const [value, setValue] = useState(currentValue);

  return (
    <button
      className={`rounded-full px-3 py-2 text-caption ${value ? "bg-uberBlack text-pureWhite" : "bg-chipGray text-uberBlack"}`}
      onClick={async () => {
        const nextValue = !value;
        setValue(nextValue);
        await fetch(`/api/admin/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: nextValue, variants: [] })
        });
        router.refresh();
      }}
      type="button"
    >
      {value ? "Active" : "Draft"}
    </button>
  );
}
