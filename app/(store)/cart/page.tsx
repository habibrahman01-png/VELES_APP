import { CartClient } from "@/components/store/cart-client";

export default function CartPage() {
  return (
    <div className="layout-shell space-y-6 py-12">
      <div className="space-y-3">
        <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Cart</p>
        <h1 className="text-section">Your Selection</h1>
      </div>
      <CartClient />
    </div>
  );
}
