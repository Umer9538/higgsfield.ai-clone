import Image from "next/image";
import { Pencil } from "lucide-react";

export function PresetCard({
  label,
  sublabel,
  image,
}: {
  label: string;
  sublabel: string;
  image: string;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-hf-border">
      <Image src={image} alt="" fill sizes="390px" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

      <button
        type="button"
        className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/80"
      >
        <Pencil className="size-3.5" aria-hidden strokeWidth={1.75} />
        Change
      </button>

      <div className="absolute right-3 bottom-3 left-3">
        <p className="font-display text-lg leading-none font-bold tracking-tight text-hf-lime uppercase">
          {label}
        </p>
        <p className="mt-1.5 truncate text-xs text-hf-muted">{sublabel}</p>
      </div>
    </div>
  );
}
