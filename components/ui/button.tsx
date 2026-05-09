import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full border border-chipGray px-4 py-3 text-body font-medium transition duration-200";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
}

export function Button({ className, variant = "primary", fullWidth, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        baseStyles,
        variant === "primary" && "bg-uberBlack text-pureWhite hover:bg-[#111111]",
        variant === "secondary" && "bg-pureWhite text-uberBlack hover:bg-hoverLight",
        variant === "ghost" && "border-transparent bg-transparent text-uberBlack hover:bg-hoverLight",
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}

export function ButtonLink({ href, children, className, variant = "primary" }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        baseStyles,
        variant === "primary" && "bg-uberBlack text-pureWhite hover:bg-[#111111]",
        variant === "secondary" && "bg-pureWhite text-uberBlack hover:bg-hoverLight",
        variant === "ghost" && "border-transparent bg-transparent text-uberBlack hover:bg-hoverLight",
        className
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
