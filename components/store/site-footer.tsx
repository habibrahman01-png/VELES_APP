import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-uberBlack py-12 text-pureWhite">
      <div className="layout-shell grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-nav tracking-[0.3em]">VELES</p>
          <p className="max-w-sm text-body text-mutedGray">
            Editorial essentials for a monochrome wardrobe, paired with a real-time commerce experience.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Shop</p>
          <div className="space-y-2 text-body">
            <Link href="/store">All Products</Link>
            <br />
            <Link href="/account">Account</Link>
            <br />
            <Link href="/cart">Cart</Link>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Need Help?</p>
          <a className="text-linkBlue underline" href="mailto:support@veles.local">
            support@veles.local
          </a>
        </div>
      </div>
    </footer>
  );
}
