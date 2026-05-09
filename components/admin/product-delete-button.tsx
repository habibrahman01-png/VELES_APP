"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductDeleteButtonProps {
  productId: string;
}

export function ProductDeleteButton({ productId }: ProductDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="underline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch(`/api/admin/products/${productId}`, {
          method: "DELETE"
        });
        router.refresh();
      }}
      type="button"
    >
      {loading ? "Deleting" : "Delete"}
    </button>
  );
}
