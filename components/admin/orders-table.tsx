"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FULFILLMENT_STATUSES } from "@/lib/constants";
import { Order } from "@/lib/types";
import { formatCurrency, formatDate, toDateString } from "@/lib/utils";

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        order.customerName.toLowerCase().includes(normalizedSearch) ||
        (order.customerEmail || "").toLowerCase().includes(normalizedSearch);

      const matchesStatus = !statusFilter || order.fulfillmentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr,280px]">
          <div className="space-y-2">
            <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Search Customers</label>
            <Input onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by customer name or email" value={searchTerm} />
          </div>
          <div className="space-y-2">
            <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Fulfillment Status</label>
            <Select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="">All Fulfillment Statuses</option>
              {FULFILLMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-chipGray text-caption uppercase tracking-[0.15em] text-mutedGray">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Customer Email</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4">Fulfillment Status</th>
                <th className="px-6 py-4">View</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr className="border-b border-chipGray last:border-b-0" key={order.id}>
                  <td className="px-6 py-4 text-body">
                    <Link className="underline" href={`/admin/orders/${order.id}`}>
                      {order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-body text-bodyGray">{order.customerName}</td>
                  <td className="px-6 py-4 text-body text-bodyGray">{order.customerEmail || "-"}</td>
                  <td className="px-6 py-4 text-body text-bodyGray">{formatDate(toDateString(order.createdAt))}</td>
                  <td className="px-6 py-4 text-body">{order.items.length}</td>
                  <td className="px-6 py-4 text-body">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <Badge tone={order.paymentStatus === "PAID" ? "success" : "warning"}>{order.paymentStatus}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusSelect orderId={order.id} value={order.fulfillmentStatus} />
                  </td>
                  <td className="px-6 py-4">
                    <ButtonLink className="px-3 py-2 text-caption" href={`/admin/orders/${order.id}`} variant="secondary">
                      View
                    </ButtonLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
