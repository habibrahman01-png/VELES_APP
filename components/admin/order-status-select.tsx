"use client";

import { useState } from "react";

import { FULFILLMENT_STATUSES } from "@/lib/constants";

interface OrderStatusSelectProps {
  orderId: string;
  value: string;
}

export function OrderStatusSelect({ orderId, value }: OrderStatusSelectProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [loading, setLoading] = useState(false);

  return (
    <select
      className="h-10 rounded-full border border-chipGray bg-pureWhite px-3 text-caption"
      disabled={loading}
      onChange={async (event) => {
        const nextValue = event.target.value;
        setCurrentValue(nextValue);
        setLoading(true);
        await fetch(`/api/admin/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fulfillmentStatus: nextValue })
        });
        setLoading(false);
      }}
      value={currentValue}
    >
      {FULFILLMENT_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
