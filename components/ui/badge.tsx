import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning";
}

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-micro",
        tone === "neutral" && "border-chipGray bg-chipGray text-uberBlack",
        tone === "success" && "border-uberBlack bg-uberBlack text-pureWhite",
        tone === "warning" && "border-chipGray bg-hoverLight text-bodyGray"
      )}
    >
      {children}
    </span>
  );
}
