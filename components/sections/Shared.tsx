import Image from "next/image";
import { ActionButton } from "@/components/ui/ActionButton";
import { SmartLink } from "@/components/ui/SmartLink";
import { routeFor } from "@/lib/routes";

export function PageHeading({
  eyebrow,
  title,
  sub,
  cta,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  cta?: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <p className="text-xs tracking-widest text-hf-muted uppercase">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 font-display text-3xl leading-tight font-bold tracking-tight text-white uppercase sm:text-4xl">
        {title}
      </h1>
      {sub ? <p className="mt-3 max-w-2xl text-sm text-hf-muted sm:text-base">{sub}</p> : null}
      {cta ? (
        <ActionButton message={`${cta} — opening your workspace`} className="mt-6">
          {cta}
        </ActionButton>
      ) : null}
    </div>
  );
}

export function RailHeading({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="font-display text-lg font-bold tracking-tight text-white uppercase sm:text-xl">
        {title}
      </h2>
      {link ? (
        <SmartLink
          label={link}
          href={routeFor(link)}
          className="inline-flex min-h-11 shrink-0 items-center text-xs text-hf-muted transition-colors hover:text-hf-lime md:min-h-0"
        />
      ) : null}
    </div>
  );
}

export function MediaTile({
  src,
  label,
  caption,
  className = "aspect-video",
}: {
  src: string;
  label?: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div className="group">
      <div className={`relative w-full overflow-hidden rounded-xl border border-hf-border ${className}`}>
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      {label ? <p className="mt-2 truncate text-xs font-medium text-white">{label}</p> : null}
      {caption ? <p className="mt-0.5 truncate text-[11px] text-hf-dim">{caption}</p> : null}
    </div>
  );
}

/** Deterministic media pick so server and client markup match. */
export function tile(index: number) {
  return `/media/effects/${(index % 15) + 1}.jpg`;
}
