import type { Metadata } from "next";
import Script from "next/script";

import { FaqAccordion } from "@/components/store/faq-accordion";

const storeName = "VELES";

const faqItems = [
  {
    question: "What types of leather jackets do you sell?",
    answer:
      "We offer genuine leather jackets, non-leather jackets, and plant-based leather jackets across both men's and women's cuts. Genuine leather delivers a traditional premium finish, non-leather offers an animal-free alternative, and plant-based leather uses innovative sustainable materials while preserving a luxurious look and feel."
  },
  {
    question: "What is plant-based leather and is it durable?",
    answer:
      "Plant-based leather is made from natural sources such as cactus fibers, mushroom mycelium, or fruit waste like apple leather. It is designed to mirror the look and feel of traditional leather while remaining sustainable and cruelty-free, and high-quality plant-based leather can last for years with proper care."
  },
  {
    question: "How do I find my jacket size?",
    answer:
      "Each product page includes a size chip selector from XS through XXL along with a live stock indicator. We recommend checking the measurements guide linked on the product page so you can compare the garment dimensions with your preferred fit before ordering."
  },
  {
    question: "Do you sell leather purses?",
    answer:
      "Yes. Our Accessories section includes men's and women's purses in genuine leather, non-leather, and plant-based leather variants, all designed with the same premium finish as the jacket collection."
  },
  {
    question: "What is your return and exchange policy?",
    answer:
      "Items can be returned within 30 days of delivery as long as they are in original condition. Exchanges are subject to stock availability, and customers can initiate a return from the Orders section of their account."
  },
  {
    question: "How do I track my order?",
    answer:
      "After placing an order, log into your account and open the Orders tab to view real-time fulfillment updates. Statuses move live from Pending to Processing, Dispatched, and Delivered as the store team updates your order."
  },
  {
    question: "Are your genuine leather jackets ethically sourced?",
    answer:
      "We are committed to responsible sourcing and thoughtful material choices across the full collection. Customers can choose from traditional genuine leather as well as fully animal-free non-leather and plant-based alternatives according to their priorities."
  },
  {
    question: "Do you ship internationally?",
    answer:
      "We are currently shipping domestically, with international shipping coming soon. Customers who want launch updates for international delivery can reach out through the Contact page."
  }
] as const;

export const metadata: Metadata = {
  title: `FAQ - Premium Leather Jackets & Accessories | ${storeName}`,
  description:
    "Find answers about our genuine leather, non-leather, and plant-based leather jackets and purses for men and women. Sizing, shipping, returns and more."
};

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <div className="layout-shell space-y-8 py-12">
      <Script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        id="faq-json-ld"
        strategy="afterInteractive"
        type="application/ld+json"
      />

      <div className="space-y-3">
        <h1 className="text-section">Frequently Asked Questions</h1>
        <p className="max-w-3xl text-body text-bodyGray">
          Find answers about genuine leather jackets, plant-based leather, men&apos;s leather jackets, women&apos;s leather purses, and the premium leather
          goods experience across sizing, shipping, returns, and care.
        </p>
      </div>

      <FaqAccordion items={[...faqItems]} />
    </div>
  );
}
