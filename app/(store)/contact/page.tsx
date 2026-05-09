import { ContactForm } from "@/components/store/contact-form";

export default function ContactPage() {
  return (
    <div className="layout-shell space-y-8 py-12">
      <div className="space-y-3">
        <h1 className="text-sub">Get in Touch</h1>
        <p className="max-w-2xl text-body text-bodyGray">
          Reach out with questions about products, orders, returns, or anything else. We&apos;re happy to help you choose the right piece from the collection.
        </p>
      </div>

      <div className="max-w-2xl">
        <ContactForm />
      </div>
    </div>
  );
}
