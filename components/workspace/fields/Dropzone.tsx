"use client";

import { useRef, useState } from "react";
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
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<string[]>([]);

  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      className={`w-full rounded-xl border border-dashed bg-hf-surface-2 px-4 py-6 text-center transition-colors hover:bg-hf-surface-3 ${
        files.length ? "border-hf-lime/60" : "border-hf-border hover:border-hf-lime/40"
      }`}
    >
      <input
        ref={input}
        type="file"
        multiple
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(event) =>
          setFiles(Array.from(event.target.files ?? []).map((file) => file.name))
        }
      />
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
      <p className="mt-3 text-sm font-medium text-white">
        {files.length ? `${files.length} file${files.length > 1 ? "s" : ""} added` : title}
      </p>
      <p className="mt-1 truncate text-xs text-hf-dim">
        {files.length ? files.join(", ") : subtitle}
      </p>
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
        <DropzoneTile key={item.id} item={item} />
      ))}
    </div>
  );
}

function DropzoneTile({
  item,
}: {
  item: { id: string; title: string; subtitle: string; icon: IconName };
}) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<string | null>(null);

  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      className={`rounded-xl border border-dashed bg-hf-surface-2 px-3 py-6 text-center transition-colors hover:bg-hf-surface-3 ${
        file ? "border-hf-lime/60" : "border-hf-border hover:border-hf-lime/40"
      }`}
    >
      <input
        ref={input}
        type="file"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(event) => setFile(event.target.files?.[0]?.name ?? null)}
      />
      <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-hf-surface-4 text-hf-muted">
        <Icon name={item.icon} className="size-4" />
      </span>
      <p className="mt-3 text-sm font-medium text-white">{item.title}</p>
      <p className="mt-1 truncate text-xs leading-snug text-hf-dim">{file ?? item.subtitle}</p>
    </button>
  );
}
