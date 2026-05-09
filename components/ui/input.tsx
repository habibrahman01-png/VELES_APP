import { forwardRef, InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-chipGray bg-pureWhite px-4 text-body text-uberBlack outline-none placeholder:text-mutedGray focus:border-uberBlack",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
