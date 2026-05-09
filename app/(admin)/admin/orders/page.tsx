import { OrdersTable } from "@/components/admin/orders-table";
import { getOrders } from "@/lib/data";

export default async function AdminOrdersPage() {
  const orders = await getOrders({ limit: 100 });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Orders</p>
        <h1 className="text-section">Order Management</h1>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
