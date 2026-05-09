"use client";

import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { db, getFirebaseClientSetupError } from "@/lib/firebase";
import { Address } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, useCartTotal } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
const shippingCost = 0;

interface CheckoutClientProps {
  defaultAddressId?: string;
  defaultName?: string;
  defaultEmail?: string;
}

interface CheckoutFormState {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const emptyFormState: CheckoutFormState = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: ""
};

function CheckoutForm({ defaultAddressId, defaultEmail, defaultName }: CheckoutClientProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartTotal();
  const total = subtotal + shippingCost;
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddressId || "");
  const [formState, setFormState] = useState<CheckoutFormState>({
    ...emptyFormState,
    fullName: defaultName || "",
    email: defaultEmail || user?.email || "",
    country: "United States"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAddresses() {
      if (!user || !db) {
        if (!db) {
          setMessage(getFirebaseClientSetupError());
        }
        return;
      }

      const snapshot = await getDocs(
        query(collection(db, "addresses"), where("userId", "==", user.uid), orderBy("isDefault", "desc"), limit(10))
      );
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Address, "id">) }));
      setAddresses(data);
      setSelectedAddressId((current) => current || data.find((entry) => entry.isDefault)?.id || data[0]?.id || "");
    }

    void loadAddresses();
  }, [user]);

  const activeAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  useEffect(() => {
    if (!activeAddress) {
      setFormState((current) => ({
        ...current,
        fullName: current.fullName || defaultName || "",
        email: current.email || defaultEmail || user?.email || ""
      }));
      return;
    }

    setFormState((current) => ({
      fullName: activeAddress.fullName || current.fullName || defaultName || "",
      email: activeAddress.email || current.email || defaultEmail || user?.email || "",
      phone: activeAddress.phone || current.phone || "",
      line1: activeAddress.line1,
      line2: activeAddress.line2 || "",
      city: activeAddress.city,
      state: activeAddress.state,
      postalCode: activeAddress.postalCode,
      country: activeAddress.country
    }));
  }, [activeAddress, defaultEmail, defaultName, user?.email]);

  function isFormValid() {
    return Object.values({
      fullName: formState.fullName,
      email: formState.email,
      phone: formState.phone,
      line1: formState.line1,
      city: formState.city,
      state: formState.state,
      postalCode: formState.postalCode,
      country: formState.country
    }).every((value) => value.trim().length > 0);
  }

  async function handleCheckout() {
    if (!stripe || !elements || !user) {
      setMessage("Sign in to continue checkout.");
      return;
    }

    if (!items.length) {
      setMessage("Your cart is empty.");
      return;
    }

    if (!isFormValid()) {
      setMessage("Complete your shipping details before placing the order.");
      return;
    }

    setLoading(true);
    setMessage("");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setMessage("Card input is unavailable.");
      setLoading(false);
      return;
    }

    const intentResponse = await fetch("/api/stripe/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        customerDetails: {
          fullName: formState.fullName.trim(),
          email: formState.email.trim(),
          phone: formState.phone.trim()
        },
        shippingAddress: {
          line1: formState.line1.trim(),
          line2: formState.line2.trim(),
          city: formState.city.trim(),
          state: formState.state.trim(),
          postalCode: formState.postalCode.trim(),
          country: formState.country.trim()
        }
      })
    });

    const intentPayload = await intentResponse.json();
    if (!intentResponse.ok) {
      setMessage(intentPayload.error || "Unable to initialize payment.");
      setLoading(false);
      return;
    }

    const result = await stripe.confirmCardPayment(intentPayload.clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: formState.fullName.trim(),
          email: formState.email.trim(),
          phone: formState.phone.trim(),
          address: {
            line1: formState.line1.trim(),
            line2: formState.line2.trim() || undefined,
            city: formState.city.trim(),
            state: formState.state.trim(),
            postal_code: formState.postalCode.trim(),
            country: formState.country.trim()
          }
        }
      },
      receipt_email: formState.email.trim()
    });

    if (result.error) {
      setMessage(result.error.message || "Payment failed.");
      setLoading(false);
      return;
    }

    clearCart();
    router.push("/account?tab=orders");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-sub">Checkout</h1>
          <p className="text-body text-bodyGray">Complete your payment securely with Stripe and reserve inventory in real time.</p>
        </div>

        <div className="space-y-3">
          <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Shipping address</label>
          <Select onChange={(event) => setSelectedAddressId(event.target.value)} value={selectedAddressId}>
            <option value="">Enter details manually</option>
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.line1}, {address.city}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))}
              placeholder="Full Name"
              required
              value={formState.fullName}
            />
            <Input
              onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
              required
              type="email"
              value={formState.email}
            />
          </div>
          <Input
            onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))}
            placeholder="Phone Number"
            required
            value={formState.phone}
          />
          <Input
            onChange={(event) => setFormState((current) => ({ ...current, line1: event.target.value }))}
            placeholder="Shipping Address Line 1"
            required
            value={formState.line1}
          />
          <Input
            onChange={(event) => setFormState((current) => ({ ...current, line2: event.target.value }))}
            placeholder="Shipping Address Line 2"
            value={formState.line2}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              onChange={(event) => setFormState((current) => ({ ...current, city: event.target.value }))}
              placeholder="City"
              required
              value={formState.city}
            />
            <Input
              onChange={(event) => setFormState((current) => ({ ...current, state: event.target.value }))}
              placeholder="State"
              required
              value={formState.state}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              onChange={(event) => setFormState((current) => ({ ...current, postalCode: event.target.value }))}
              placeholder="Postal Code"
              required
              value={formState.postalCode}
            />
            <Input
              onChange={(event) => setFormState((current) => ({ ...current, country: event.target.value }))}
              placeholder="Country"
              required
              value={formState.country}
            />
          </div>
          {!addresses.length ? <p className="text-caption text-bodyGray">No saved address found. Enter your shipping details to continue.</p> : null}
        </div>

        <div className="space-y-3">
          <label className="text-caption uppercase tracking-[0.2em] text-mutedGray">Card details</label>
          <div className="rounded-[24px] border border-chipGray p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: "16px",
                    color: "#000000",
                    "::placeholder": {
                      color: "#afafaf"
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {message ? <p className="text-caption text-bodyGray">{message}</p> : null}

        <Button disabled={loading || !items.length} fullWidth onClick={handleCheckout} type="button">
          {loading ? "Processing" : "Pay And Place Order"}
        </Button>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-small">Order Summary</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div className="flex items-center justify-between gap-4" key={`${item.productId}-${item.size}`}>
              <div>
                <p className="text-body">{item.productName}</p>
                <p className="text-caption text-bodyGray">
                  {item.size} x {item.quantity}
                </p>
              </div>
              <span className="text-body">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-chipGray pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-body text-bodyGray">Subtotal</span>
            <span className="text-body">{formatCurrency(subtotal)}</span>
          </div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-body text-bodyGray">Shipping</span>
            <span className="text-body">{formatCurrency(shippingCost)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-small">Total</span>
            <span className="text-sub">{formatCurrency(total)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function CheckoutClient({ defaultAddressId, defaultEmail, defaultName }: CheckoutClientProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm defaultAddressId={defaultAddressId} defaultEmail={defaultEmail} defaultName={defaultName} />
    </Elements>
  );
}
