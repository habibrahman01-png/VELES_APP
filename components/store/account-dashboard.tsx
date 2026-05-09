"use client";

import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth, db, getFirebaseClientSetupError } from "@/lib/firebase";
import { Address, Order, UserProfile } from "@/lib/types";
import { formatCurrency, formatDate, toDateString } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist";

const tabs = ["profile", "orders", "addresses"] as const;

type TabKey = (typeof tabs)[number];

interface AddressFormState {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const emptyAddressForm: AddressFormState = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false
};

interface AccountDashboardProps {
  initialProfile: UserProfile | null;
}

export function AccountDashboard({ initialProfile }: AccountDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const clearWishlistItems = useWishlistStore((state) => state.clearItems);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [status, setStatus] = useState("");
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const activeTab = useMemo(() => {
    const queryTab = searchParams.get("tab");
    return tabs.includes(queryTab as TabKey) ? (queryTab as TabKey) : "profile";
  }, [searchParams]);

  async function refreshAddresses(uid: string) {
    if (!db) {
      setAddresses([]);
      return;
    }

    const snapshot = await getDocs(query(collection(db, "addresses"), where("userId", "==", uid), orderBy("isDefault", "desc")));
    setAddresses(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Address, "id">) })));
  }

  useEffect(() => {
    async function loadProfile() {
      if (!user || !db) return;
      const snapshot = await getDoc(doc(db, "users", user.uid));
      if (snapshot.exists()) {
        setProfile({ id: snapshot.id, ...(snapshot.data() as Omit<UserProfile, "id">) });
      }
    }

    async function loadAddresses() {
      if (!user || !db) return;
      await refreshAddresses(user.uid);
    }

    void loadProfile();
    void loadAddresses();
  }, [user]);

  useEffect(() => {
    if (!user || !db) return;

    const unsubscribe = onSnapshot(
      query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc")),
      (snapshot) => {
        setOrders(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Order, "id">) })));
      }
    );

    return unsubscribe;
  }, [user]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !db) {
      setStatus(getFirebaseClientSetupError());
      return;
    }

    const formData = new FormData(event.currentTarget);
    await updateDoc(doc(db, "users", user.uid), {
      name: String(formData.get("name") || ""),
      email: user.email || ""
    });
    setProfile((current) =>
      current
        ? {
            ...current,
            name: String(formData.get("name") || ""),
            email: user.email || ""
          }
        : current
    );
    setStatus("Profile updated.");
  }

  async function syncDefaultAddress(userId: string, nextDefaultId: string) {
    if (!db) {
      return;
    }

    const snapshot = await getDocs(query(collection(db, "addresses"), where("userId", "==", userId)));
    const batch = writeBatch(db);

    snapshot.docs.forEach((item) => {
      batch.update(item.ref, {
        isDefault: item.id === nextDefaultId
      });
    });

    batch.update(doc(db, "users", userId), {
      defaultAddressId: nextDefaultId
    });

    await batch.commit();
    setProfile((current) => (current ? { ...current, defaultAddressId: nextDefaultId } : current));
  }

  function resetAddressEditor() {
    setEditingAddressId(null);
    setAddressForm({
      ...emptyAddressForm,
      fullName: profile?.name || user?.displayName || "",
      email: profile?.email || user?.email || ""
    });
  }

  function startAddressEdit(address: Address) {
    setEditingAddressId(address.id);
    setAddressForm({
      fullName: address.fullName || profile?.name || user?.displayName || "",
      email: address.email || profile?.email || user?.email || "",
      phone: address.phone || "",
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !db) {
      setStatus(getFirebaseClientSetupError());
      return;
    }

    const shouldBeDefault = addressForm.isDefault || (!addresses.length && !editingAddressId);
    const addressPayload = {
      userId: user.uid,
      fullName: addressForm.fullName,
      email: addressForm.email,
      phone: addressForm.phone,
      line1: addressForm.line1,
      line2: addressForm.line2,
      city: addressForm.city,
      state: addressForm.state,
      postalCode: addressForm.postalCode,
      country: addressForm.country,
      isDefault: shouldBeDefault
    };

    if (editingAddressId) {
      await updateDoc(doc(db, "addresses", editingAddressId), addressPayload);

      if (shouldBeDefault) {
        await syncDefaultAddress(user.uid, editingAddressId);
      } else if (profile?.defaultAddressId === editingAddressId) {
        await updateDoc(doc(db, "users", user.uid), {
          defaultAddressId: ""
        });
        setProfile((current) => (current ? { ...current, defaultAddressId: "" } : current));
      }
    } else {
      const created = await addDoc(collection(db, "addresses"), {
        ...addressPayload,
        createdAt: serverTimestamp()
      });

      if (shouldBeDefault) {
        await syncDefaultAddress(user.uid, created.id);
      }
    }

    await refreshAddresses(user.uid);
    setStatus(editingAddressId ? "Address updated." : "Address saved.");
    resetAddressEditor();
  }

  async function removeAddress(addressId: string) {
    if (!db) {
      setStatus(getFirebaseClientSetupError());
      return;
    }

    await deleteDoc(doc(db, "addresses", addressId));
    const remainingAddresses = addresses.filter((item) => item.id !== addressId);
    setAddresses(remainingAddresses);

    if (user && profile?.defaultAddressId === addressId) {
      if (remainingAddresses[0]) {
        await syncDefaultAddress(user.uid, remainingAddresses[0].id);
        await refreshAddresses(user.uid);
      } else {
        await updateDoc(doc(db, "users", user.uid), {
          defaultAddressId: ""
        });
        setProfile((current) => (current ? { ...current, defaultAddressId: "" } : current));
      }
    }

    if (editingAddressId === addressId) {
      resetAddressEditor();
    }
    setStatus("Address removed.");
  }

  async function logout() {
    clearAuth();
    clearWishlistItems();

    if (!auth) {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
      return;
    }

    await fetch("/api/auth/logout", { method: "POST" });
    await signOut(auth);
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    setAddressForm((current) => ({
      ...current,
      fullName: current.fullName || initialProfile?.name || user?.displayName || "",
      email: current.email || initialProfile?.email || user?.email || ""
    }));
  }, [initialProfile?.email, initialProfile?.name, user?.displayName, user?.email]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            className={`rounded-full border px-4 py-2 text-caption ${activeTab === tab ? "border-uberBlack bg-uberBlack text-pureWhite" : "border-chipGray bg-chipGray"}`}
            key={tab}
            onClick={() => router.push(`/account?tab=${tab}`)}
            type="button"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button className="ml-auto text-caption text-bodyGray underline" onClick={logout} type="button">
          Logout
        </button>
      </div>

      {status ? <p className="text-caption text-bodyGray">{status}</p> : null}

      {activeTab === "profile" ? (
        <Card className="max-w-2xl p-6">
          <form className="space-y-4" onSubmit={saveProfile}>
            <Input defaultValue={profile?.name || user?.displayName || ""} name="name" placeholder="Full name" required />
            <Input defaultValue={profile?.email || user?.email || ""} disabled name="email" placeholder="Email" type="email" />
            <Button type="submit">Update Profile</Button>
          </form>
        </Card>
      ) : null}

      {activeTab === "orders" ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card className="space-y-4 p-6" key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-small">Order {order.id.slice(0, 8)}</p>
                  <p className="text-caption text-bodyGray">{formatDate(toDateString(order.createdAt))}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="neutral">{order.paymentStatus}</Badge>
                  <Badge tone={order.fulfillmentStatus === "DELIVERED" ? "success" : "warning"}>
                    <span className="status-pulse pr-3">{order.fulfillmentStatus}</span>
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div className="flex items-center justify-between gap-4" key={`${item.productId}-${item.size}`}>
                    <p className="text-body">
                      {item.productName} / {item.size} x {item.quantity}
                    </p>
                    <span className="text-body">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-chipGray pt-4">
                <span className="text-body text-bodyGray">Total Paid</span>
                <span className="text-small">{formatCurrency(order.total)}</span>
              </div>
            </Card>
          ))}
          {!orders.length ? <Card className="p-6 text-body text-bodyGray">Orders will appear here in real time as status changes occur.</Card> : null}
        </div>
      ) : null}

      {activeTab === "addresses" ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <Card className="p-6">
            <form className="space-y-4" onSubmit={saveAddress}>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="fullName"
                  onChange={(event) => setAddressForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Full name"
                  required
                  value={addressForm.fullName}
                />
                <Input
                  name="email"
                  onChange={(event) => setAddressForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Email"
                  required
                  type="email"
                  value={addressForm.email}
                />
              </div>
              <Input
                name="phone"
                onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Phone number"
                required
                value={addressForm.phone}
              />
              <Input
                name="line1"
                onChange={(event) => setAddressForm((current) => ({ ...current, line1: event.target.value }))}
                placeholder="Address line 1"
                required
                value={addressForm.line1}
              />
              <Input
                name="line2"
                onChange={(event) => setAddressForm((current) => ({ ...current, line2: event.target.value }))}
                placeholder="Address line 2"
                value={addressForm.line2}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="city"
                  onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))}
                  placeholder="City"
                  required
                  value={addressForm.city}
                />
                <Input
                  name="state"
                  onChange={(event) => setAddressForm((current) => ({ ...current, state: event.target.value }))}
                  placeholder="State"
                  required
                  value={addressForm.state}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="postalCode"
                  onChange={(event) => setAddressForm((current) => ({ ...current, postalCode: event.target.value }))}
                  placeholder="Postal code"
                  required
                  value={addressForm.postalCode}
                />
                <Input
                  name="country"
                  onChange={(event) => setAddressForm((current) => ({ ...current, country: event.target.value }))}
                  placeholder="Country"
                  required
                  value={addressForm.country}
                />
              </div>
              <label className="flex items-center gap-3 text-caption text-bodyGray">
                <input
                  checked={addressForm.isDefault}
                  name="isDefault"
                  onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))}
                  type="checkbox"
                />
                Set as default
              </label>
              <div className="flex flex-wrap gap-3">
                <Button type="submit">{editingAddressId ? "Update Address" : "Save Address"}</Button>
                {editingAddressId ? (
                  <Button onClick={resetAddressEditor} type="button" variant="secondary">
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            {addresses.map((address) => (
              <Card className="space-y-4 p-6" key={address.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="text-body text-bodyGray">
                    <p>{address.fullName || profile?.name || user?.displayName || "VELES Customer"}</p>
                    <p>{address.email || profile?.email || user?.email || ""}</p>
                    <p>{address.phone || ""}</p>
                    <p>{address.line1}</p>
                    {address.line2 ? <p>{address.line2}</p> : null}
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                  </div>
                  {address.isDefault ? <Badge tone="success">Default</Badge> : null}
                </div>
                <div className="flex gap-4 text-caption text-bodyGray">
                  <button className="underline" onClick={() => startAddressEdit(address)} type="button">
                    Edit
                  </button>
                  <button className="underline" onClick={() => removeAddress(address.id)} type="button">
                    Remove
                  </button>
                </div>
              </Card>
            ))}
            {!addresses.length ? <Card className="p-6 text-body text-bodyGray">No addresses saved yet.</Card> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
