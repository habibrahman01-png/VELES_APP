import { MetricsCard } from "@/components/admin/metrics-card";
import { Card } from "@/components/ui/card";
import { getDashboardMetrics, getRecentOrders } from "@/lib/data";
import { formatCurrency, formatDate, toDateString } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [metrics, recentOrders] = await Promise.all([getDashboardMetrics(), getRecentOrders(10)]);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Overview</p>
        <h1 className="text-section">Admin Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricsCard hint="Paid orders only" label="Total Revenue" value={formatCurrency(metrics.revenue)} />
        <MetricsCard hint="All order documents" label="Total Orders" value={String(metrics.orderCount)} />
        <MetricsCard hint="Non-deleted products" label="Total Products" value={String(metrics.productCount)} />
        <MetricsCard hint="Collection group query" label="Low Stock Alerts" value={String(metrics.lowStockCount)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-chipGray px-6 py-4">
            <h2 className="text-small">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-chipGray text-caption uppercase tracking-[0.15em] text-mutedGray">
                <tr>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr className="border-b border-chipGray last:border-b-0" key={order.id}>
                    <td className="px-6 py-4 text-body">{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-body text-bodyGray">{order.customerName}</td>
                    <td className="px-6 py-4 text-body text-bodyGray">{formatDate(toDateString(order.createdAt))}</td>
                    <td className="px-6 py-4 text-body">{formatCurrency(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-small">Top Products</h2>
          <div className="space-y-4">
            {metrics.topProducts.map((product) => (
              <div className="flex items-center justify-between gap-4" key={product.id}>
                <div>
                  <p className="text-body">{product.name}</p>
                  <p className="text-caption text-bodyGray">Ordered quantity</p>
                </div>
                <span className="text-small">{product.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
