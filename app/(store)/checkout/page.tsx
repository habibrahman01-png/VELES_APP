import { redirect } from "next/navigation";

import { CheckoutClient } from "@/components/store/checkout-client";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function CheckoutPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="layout-shell py-12">
      <CheckoutClient defaultAddressId={profile.defaultAddressId} defaultEmail={profile.email} defaultName={profile.name} />
    </div>
  );
}
