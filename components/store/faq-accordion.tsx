"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <Card key={item.question}>
            <button
              className="flex w-full items-center justify-between gap-4 p-6 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              type="button"
            >
              <span className="text-small font-bold">{item.question}</span>
              <span className="text-small">{isOpen ? "-" : "+"}</span>
            </button>
            <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr] px-6 pb-6" : "grid-rows-[0fr] px-6")}>
              <div className="overflow-hidden">
                <p className="text-body text-bodyGray">{item.answer}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
