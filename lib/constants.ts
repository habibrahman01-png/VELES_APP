export const CATEGORIES = ["Men", "Women", "Accessories"] as const;
export const MATERIAL_FILTERS = ["Genuine Leather", "Non-Leather", "Plant-Based Leather"] as const;
export const PRODUCT_TYPES = [
  "Genuine Leather Jacket",
  "Non-Leather Jacket",
  "Plant-Based Leather Jacket",
  "Leather Purse",
  "Non-Leather Purse",
  "Plant-Based Leather Purse"
] as const;
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"] as const;
export const FULFILLMENT_STATUSES = ["PENDING", "PROCESSING", "DISPATCHED", "DELIVERED"] as const;

export const NAV_LINKS = [
  { label: "Store", href: "/store" },
  { label: "About Us", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" }
] as const;

export const FEATURED_CATEGORIES = [
  {
    title: "Men",
    description: "Premium genuine leather, non-leather, and plant-based leather jackets built with precise tailoring.",
    href: "/store?category=Men"
  },
  {
    title: "Women",
    description: "Luxury jackets for women across genuine leather, non-leather, and plant-based leather finishes.",
    href: "/store?category=Women"
  },
  {
    title: "Accessories",
    description: "Leather, non-leather, and plant-based leather purses for men and women.",
    href: "/store?category=Accessories"
  }
] as const;
