import { forwardRef, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-[24px] border border-chipGray bg-pureWhite px-4 py-3 text-body text-uberBlack outline-none placeholder:text-mutedGray focus:border-uberBlack",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
