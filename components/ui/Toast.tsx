"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Check, Info, X } from "lucide-react";

export interface Toast {
  id: number;
  message: string;
  tone: "success" | "info";
}

interface ToastContextValue {
  toast: (message: string, tone?: Toast["tone"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: Toast["tone"] = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            data-toast
            className="pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl border border-hf-border bg-hf-surface-3 px-4 py-3 shadow-lg"
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                item.tone === "success" ? "bg-hf-lime text-black" : "bg-hf-surface-4 text-hf-lime"
              }`}
            >
              {item.tone === "success" ? (
                <Check className="size-3" aria-hidden strokeWidth={3} />
              ) : (
                <Info className="size-3" aria-hidden strokeWidth={2.5} />
              )}
            </span>
            <p className="min-w-0 flex-1 text-sm text-white">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
              className="shrink-0 text-hf-dim transition-colors hover:text-white"
            >
              <X className="size-3.5" aria-hidden strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  // Falling back keeps components usable in isolation (and in tests) without a provider.
  return context ?? { toast: () => {} };
}
