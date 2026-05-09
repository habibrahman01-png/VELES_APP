import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" }
];

export function AdminSidebar() {
  return (
    <aside className="min-h-screen bg-uberBlack px-6 py-8 text-pureWhite">
      <div className="space-y-8">
        <div>
          <p className="text-nav tracking-[0.3em]">VELES</p>
          <p className="mt-2 text-caption text-mutedGray">Admin Dashboard</p>
        </div>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link className="block rounded-2xl px-4 py-3 text-body transition hover:bg-[#111111]" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
