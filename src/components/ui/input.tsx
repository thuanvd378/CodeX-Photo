import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 text-sm text-[rgb(var(--text))] outline-none transition placeholder:text-[rgb(var(--muted))] focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
