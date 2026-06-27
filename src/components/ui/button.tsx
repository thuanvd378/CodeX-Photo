import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-strong))] disabled:bg-surface-200 disabled:text-surface-700 dark:disabled:bg-surface-700 dark:disabled:text-surface-200",
  secondary: "border border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--text))] hover:bg-[rgb(var(--panel-subtle))]",
  ghost: "text-[rgb(var(--muted))] hover:bg-[rgb(var(--panel-subtle))] hover:text-[rgb(var(--text))]",
  danger: "border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  icon: "h-9 w-9 p-0"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", icon, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] disabled:cursor-not-allowed disabled:opacity-70",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
);

Button.displayName = "Button";
