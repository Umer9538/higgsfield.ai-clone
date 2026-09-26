"use client";

import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useDialogFocus, useScrollLock } from "./overlay";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useScrollLock(open);

  // A stable close for the shared focus hook: callers often pass an inline
  // arrow, and an effect keyed on it re-ran on every parent render, pulling
  // focus back to the close button (e.g. away from the palette above it).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const close = useCallback(() => onCloseRef.current(), []);
  // Focus in, Tab contained, Escape closes, focus returns to the opener
  useDialogFocus(panelRef, open, close);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-modal
        className="glass animate-reveal relative z-10 max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-panel)] p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-lg font-bold tracking-[-0.025em] text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1 text-hf-dim transition-colors hover:bg-hf-surface-3 hover:text-white"
          >
            <X className="size-4" aria-hidden strokeWidth={2} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
