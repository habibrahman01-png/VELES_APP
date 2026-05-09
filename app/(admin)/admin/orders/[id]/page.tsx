import Image from "next/image";
import { notFound } from "next/navigation";

import { StatusActionButtons } from "@/components/admin/status-action-buttons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getOrderById } from "@/lib/data";
import { formatCurrency, formatDate, toDateString } from "@/lib/utils";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  const shippingAddress = order.shippingAddress || order.addressSnapshot;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Order Detail</p>
        <h1 className="text-section">Order {order.id.slice(0, 8)}</h1>
      </div>

      <StatusActionButtons orderId={order.id} />

      <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <Card className="space-y-4 p-6">
          <div>
            <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Customer</p>
            <p className="mt-3 text-small">{order.customerName}</p>
            <p className="mt-2 text-body text-bodyGray">{order.customerEmail || "No email captured"}</p>
            <p className="mt-2 text-body text-bodyGray">{order.customerPhone || "No phone captured"}</p>
            <p className="mt-2 text-body text-bodyGray">{formatDate(toDateString(order.createdAt))}</p>
          </div>
          <div>
            <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Shipping Address</p>
            <div className="mt-3 space-y-1 text-body text-bodyGray">
              {shippingAddress ? (
                <>
                  {"fullName" in shippingAddress && shippingAddress.fullName ? <p>{shippingAddress.fullName}</p> : null}
                  <p>{shippingAddress.line1}</p>
                  {shippingAddress.line2 ? <p>{shippingAddress.line2}</p> : null}
                  <p>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                  <p>{shippingAddress.country}</p>
                </>
              ) : (
                <p>No shipping address captured.</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Payment</p>
            <div className="mt-3 space-y-1 text-body text-bodyGray">
              <div className="flex flex-wrap gap-3">
                <Badge tone={order.paymentStatus === "PAID" ? "success" : "warning"}>{order.paymentStatus}</Badge>
                <Badge tone={order.fulfillmentStatus === "DELIVERED" ? "success" : "warning"}>{order.fulfillmentStatus}</Badge>
              </div>
              <p>Intent: {order.stripePaymentIntentId}</p>
              <p>Subtotal: {formatCurrency(order.subtotal || order.total)}</p>
              <p>Shipping: {formatCurrency(order.shippingCost || 0)}</p>
              <p>Total: {formatCurrency(order.total)}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-small">Line Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div className="flex items-center justify-between gap-4 border-b border-chipGray pb-4 last:border-b-0 last:pb-0" key={`${item.productId}-${item.size}`}>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-16 overflow-hidden rounded-[18px] bg-chipGray">
                    <Image alt={item.productName} className="object-cover" fill src={item.imageUrl || "/placeholder.svg"} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-body">{item.productName}</p>
                    <p className="text-caption text-bodyGray">{item.productType}</p>
                    <p className="text-caption text-bodyGray">
                      {item.size} x {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-body">{formatCurrency(item.priceAtPurchase)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
