"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface StatusActionButtonsProps {
  orderId: string;
}

const actions = [
  { label: "Mark as Processing", status: "PROCESSING" },
  { label: "Mark as Dispatched", status: "DISPATCHED" },
  { label: "Mark as Delivered", status: "DELIVERED" }
];

export function StatusActionButtons({ orderId }: StatusActionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button
          key={action.status}
          onClick={async () => {
            setLoading(action.status);
            await fetch(`/api/admin/orders/${orderId}/status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fulfillmentStatus: action.status })
            });
            setLoading(null);
            router.refresh();
          }}
          type="button"
          variant="secondary"
        >
          {loading === action.status ? "Updating" : action.label}
        </Button>
      ))}
    </div>
  );
}
