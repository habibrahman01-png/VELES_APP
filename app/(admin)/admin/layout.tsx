import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getServerSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/account");
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[260px,1fr]">
      <AdminSidebar />
      <main className="bg-pureWhite">
        <div className="layout-shell py-8">{children}</div>
      </main>
    </div>
  );
}
