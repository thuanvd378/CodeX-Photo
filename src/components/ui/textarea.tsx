import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-32 w-full resize-none rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-3 text-sm leading-6 text-[rgb(var(--text))] outline-none transition placeholder:text-[rgb(var(--muted))] focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
