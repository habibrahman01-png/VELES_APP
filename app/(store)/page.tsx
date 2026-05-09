import { ProductCard } from "@/components/store/product-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FEATURED_CATEGORIES } from "@/lib/constants";
import { getLatestProducts } from "@/lib/data";

export default async function HomePage() {
  const products = await getLatestProducts(8);

  return (
    <div className="space-y-16 pb-16">
      <section className="layout-shell grid gap-8 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:py-16">
        <div className="space-y-6">
          <p className="text-caption uppercase tracking-[0.25em] text-mutedGray">Stark Duality</p>
          <h1 className="max-w-3xl text-hero">Premium Leather. Uncompromising Quality.</h1>
          <p className="max-w-2xl text-body text-bodyGray">
            VELES delivers precision-made men&apos;s and women&apos;s jackets in genuine leather, non-leather, and plant-based leather, alongside premium purses in the same considered finishes.
          </p>
          <ButtonLink href="/store">Shop New Arrivals</ButtonLink>
        </div>
        <Card className="flex min-h-[420px] items-end bg-uberBlack p-8 text-pureWhite">
          <div className="space-y-4">
            <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">Collection Note</p>
            <p className="max-w-lg text-sub">Luxury outerwear and accessories shaped by clean lines, exact construction, and premium materials.</p>
          </div>
        </Card>
      </section>

      <section className="layout-shell space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-section">Featured Categories</h2>
          <ButtonLink href="/store" variant="secondary">
            View All
          </ButtonLink>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {FEATURED_CATEGORIES.map((category) => (
            <Card className="space-y-6 p-6" key={category.title}>
              <div className="space-y-3">
                <p className="text-card">{category.title}</p>
                <p className="text-body text-bodyGray">{category.description}</p>
              </div>
              <ButtonLink href={category.href} variant="secondary">
                Explore
              </ButtonLink>
            </Card>
          ))}
        </div>
      </section>

      <section className="layout-shell space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-section">New Arrivals</h2>
          <ButtonLink href="/store">Shop All</ButtonLink>
        </div>
        {products.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-body text-bodyGray">No products are available yet. Seed Firebase after configuring your environment to populate the storefront.</Card>
        )}
      </section>
    </div>
  );
}
