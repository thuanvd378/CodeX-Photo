import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Slider({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className={cn("h-2 w-full accent-[rgb(var(--accent))]", className)}
      {...props}
    />
  );
}
