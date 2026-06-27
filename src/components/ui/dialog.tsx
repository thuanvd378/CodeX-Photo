import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onOpenChange: (open: boolean) => void;
}

export function Dialog({ open, title, description, children, footer, onOpenChange }: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[rgb(var(--border))] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[rgb(var(--text))]">{title}</h2>
            {description ? <p className="mt-1 text-sm text-[rgb(var(--muted))]">{description}</p> : null}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Dong">
            <X size={18} />
          </Button>
        </div>
        <div className="max-h-[62vh] overflow-y-auto px-5 py-5 scrollbar-thin">{children}</div>
        {footer ? <div className="border-t border-[rgb(var(--border))] px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
