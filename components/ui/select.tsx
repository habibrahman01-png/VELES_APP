import { forwardRef, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...props },
  ref
) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-2xl border border-chipGray bg-pureWhite px-4 text-body text-uberBlack outline-none focus:border-uberBlack",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
