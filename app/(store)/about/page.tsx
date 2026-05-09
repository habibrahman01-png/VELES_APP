import { Card } from "@/components/ui/card";

const pillars = [
  {
    title: "Quality",
    description: "Every silhouette is chosen for structure, comfort, and longevity. The result is a collection that feels precise from first wear onward."
  },
  {
    title: "Sustainability",
    description: "We curate across genuine leather, ethical non-leather, and plant-based alternatives. That material range lets customers choose the finish that aligns with their values."
  },
  {
    title: "Craftsmanship",
    description: "Sharp lines, balanced proportions, and refined detailing shape every piece. Each jacket and purse is designed to feel editorial yet enduring in everyday use."
  }
];

export default function AboutPage() {
  return (
    <div className="layout-shell space-y-10 py-12">
      <section className="space-y-4">
        <h1 className="text-sub">About Us</h1>
        <div className="max-w-3xl space-y-4 text-body text-bodyGray">
          <p>
            VELES is a premium leather goods brand devoted to modern jackets and accessories for men and women. Our collections are guided by restraint,
            luxury, and a belief that timeless design should feel effortless to wear.
          </p>
          <p>
            We work across genuine leather, ethical non-leather, and innovative plant-based leather materials to create pieces with character and clarity.
            Each finish is selected for its tactile appeal, visual depth, and ability to support sharp tailoring.
          </p>
          <p>
            From structured men&apos;s jackets to refined women&apos;s silhouettes and elevated accessories, every product is shaped to balance presence with
            practicality. The brand language is understated, but the craftsmanship is meant to be seen in every seam and proportion.
          </p>
          <p>
            Our approach is editorial rather than seasonal. We build a focused wardrobe of premium essentials designed to move quietly through everyday life
            while still carrying the confidence of luxury.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {pillars.map((pillar) => (
          <Card className="space-y-3 p-6" key={pillar.title}>
            <h2 className="text-body font-semibold">{pillar.title}</h2>
            <p className="text-body text-bodyGray">{pillar.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
