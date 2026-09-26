"use client";

import { Copy } from "lucide-react";
import { JsonView } from "@/components/ui/JsonView";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

/** The generation's configuration as JSON, with a copy button. */
export function JsonInspector({
  data,
  label,
  onClose,
}: {
  data: Record<string, unknown> | null;
  label?: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  return (
    <Modal open={data !== null} onClose={onClose} title="Generation metadata">
      <p className="mb-3 text-sm text-hf-muted">
        Exactly what is configured in {label ?? "this studio"} right now — the body a real
        render request would carry.
      </p>
      {data ? <JsonView value={data} /> : null}
      <button
        type="button"
        onClick={() =>
          navigator.clipboard
            .writeText(JSON.stringify(data, null, 2))
            .then(() => toast("JSON copied"))
            .catch(() => toast("Copy blocked by the browser", "info"))
        }
        className="press mt-3 flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-hf-border px-4 text-sm text-white hover:border-hf-accent/50"
      >
        <Copy className="size-4" aria-hidden strokeWidth={1.75} />
        Copy JSON
      </button>
    </Modal>
  );
}
