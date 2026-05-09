import { redirect } from "next/navigation";

import { AccountDashboard } from "@/components/store/account-dashboard";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function AccountPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="layout-shell space-y-6 py-12">
      <div className="space-y-3">
        <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Account</p>
        <h1 className="text-section">Your VELES Account</h1>
      </div>
      <AccountDashboard initialProfile={profile} />
    </div>
  );
}
