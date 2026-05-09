import { Card } from "@/components/ui/card";
import { getCustomerSummaries } from "@/lib/data";
import { formatDate, toDateString } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await getCustomerSummaries();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Customers</p>
        <h1 className="text-section">Customer Directory</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-chipGray text-caption uppercase tracking-[0.15em] text-mutedGray">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4">Orders</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr className="border-b border-chipGray last:border-b-0" key={customer.id}>
                  <td className="px-6 py-4 text-body">{customer.name}</td>
                  <td className="px-6 py-4 text-body text-bodyGray">{customer.email}</td>
                  <td className="px-6 py-4 text-body text-bodyGray">{formatDate(toDateString(customer.createdAt))}</td>
                  <td className="px-6 py-4 text-body">{customer.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
