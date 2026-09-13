import { Icon } from "../Icon";
import type { IconName } from "@/lib/workspace/types";

export function Dropzone({
  title,
  subtitle,
  accepts,
}: {
  title: string;
  subtitle?: string;
  accepts: IconName[];
}) {
  return (
    <button
      type="button"
      className="w-full rounded-xl border border-dashed border-hf-border bg-hf-surface-2 px-4 py-6 text-center transition-colors hover:border-hf-lime/40 hover:bg-hf-surface-3"
    >
      <div className="flex items-center justify-center gap-2">
        {accepts.map((name) => (
          <span
            key={name}
            className="flex size-9 items-center justify-center rounded-full bg-hf-surface-4 text-hf-muted"
          >
            <Icon name={name} className="size-4" />
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm font-medium text-white">{title}</p>
      {subtitle ? <p className="mt-1 text-xs text-hf-dim">{subtitle}</p> : null}
    </button>
  );
}

export function DropzoneRow({
  items,
}: {
  items: { id: string; title: string; subtitle: string; icon: IconName }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="rounded-xl border border-dashed border-hf-border bg-hf-surface-2 px-3 py-6 text-center transition-colors hover:border-hf-lime/40 hover:bg-hf-surface-3"
        >
          <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-hf-surface-4 text-hf-muted">
            <Icon name={item.icon} className="size-4" />
          </span>
          <p className="mt-3 text-sm font-medium text-white">{item.title}</p>
          <p className="mt-1 text-xs leading-snug text-hf-dim">{item.subtitle}</p>
        </button>
      ))}
    </div>
  );
}
