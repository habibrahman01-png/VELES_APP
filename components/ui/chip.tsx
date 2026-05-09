import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ className, active, disabled, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        "rounded-full border px-4 py-2 text-caption transition",
        active ? "border-uberBlack bg-uberBlack text-pureWhite" : "border-chipGray bg-chipGray text-uberBlack hover:bg-hoverGray",
        disabled && "cursor-not-allowed border-chipGray bg-hoverLight text-mutedGray hover:bg-hoverLight",
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
