import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { Button } from "./button";
import type { ToastState } from "../../app/editor-store";

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) {
    return null;
  }

  const Icon = toast.kind === "success" ? CheckCircle2 : toast.kind === "error" ? XCircle : Info;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 shadow-xl">
      <div className="flex gap-3">
        <Icon
          size={20}
          className={
            toast.kind === "success"
              ? "mt-0.5 text-emerald-600"
              : toast.kind === "error"
                ? "mt-0.5 text-rose-600"
                : "mt-0.5 text-[rgb(var(--accent))]"
          }
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[rgb(var(--text))]">{toast.title}</div>
          {toast.body ? <div className="mt-1 max-h-24 overflow-auto text-xs leading-5 text-[rgb(var(--muted))]">{toast.body}</div> : null}
        </div>
        <Button size="icon" variant="ghost" onClick={onDismiss} aria-label="Dong thong bao">
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}
