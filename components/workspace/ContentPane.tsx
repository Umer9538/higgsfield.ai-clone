import Image from "next/image";
import { BookOpen, ChevronLeft, ChevronRight, Folder } from "lucide-react";
import type { Content } from "@/lib/workspace/types";

function Headline({ text, highlight }: { text: string; highlight?: string }) {
  return (
    <h1 className="font-display text-3xl leading-[1.05] font-bold tracking-tight text-white uppercase sm:text-4xl lg:text-5xl">
      {text}
      {highlight ? (
        <>
          {" "}
          <span className="text-hf-lime">{highlight}</span>
        </>
      ) : null}
    </h1>
  );
}

/** Media tile. Assets are mirrored into public/media so nothing hotlinks at runtime. */
function Tile({ src, className = "", sizes = "33vw" }: { src: string; className?: string; sizes?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-hf-border bg-hf-surface-3 ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
    </div>
  );
}

export function ContentPane({ content }: { content: Content }) {
  if (content.kind === "steps") {
    return (
      <div className="mx-auto max-w-4xl">
        <Headline text={content.headline} />
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-hf-muted sm:text-base">
          {content.sub}
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {content.steps.map((step, index) => (
            <div key={step.title}>
              <Tile src={`/media/steps/${index + 1}.jpg`} className="aspect-[4/3] w-full" />
              <p className="mt-3 font-display text-sm font-bold tracking-tight text-white uppercase">
                {step.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-hf-muted">{step.caption}</p>
            </div>
          ))}
        </div>

        {content.footer ? (
          <div className="mt-8 rounded-2xl border border-hf-border bg-hf-surface p-5">
            <p className="text-sm font-medium text-white">{content.footer.title}</p>
            <p className="mt-1 text-sm text-hf-muted">{content.footer.sub}</p>
          </div>
        ) : null}
      </div>
    );
  }

  if (content.kind === "carousel") {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <Tile src="/media/presets/1.jpg" className="aspect-video w-full" sizes="768px" />
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
          {content.headline}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-hf-muted">{content.sub}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous preset"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hf-border text-hf-muted transition-colors hover:text-white"
          >
            <ChevronLeft className="size-4" aria-hidden strokeWidth={1.75} />
          </button>

          <div className="flex items-center gap-2 overflow-x-auto">
            {content.slides.map((slide, index) => (
              <span
                key={slide.title}
                title={slide.title}
                className={`relative size-11 shrink-0 overflow-hidden rounded-full border ${
                  index === 0 ? "border-hf-lime" : "border-hf-border"
                }`}
              >
                <Image
                  src={`/media/library/${(index % 5) + 1}.jpg`}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </span>
            ))}
          </div>

          <button
            type="button"
            aria-label="Next preset"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hf-border text-hf-muted transition-colors hover:text-white"
          >
            <ChevronRight className="size-4" aria-hidden strokeWidth={1.75} />
          </button>
        </div>
      </div>
    );
  }

  if (content.kind === "library") {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-hf-border bg-hf-surface p-6 sm:p-8">
          <Headline text={content.headline} highlight={content.highlight} />
          <p className="mt-3 max-w-md text-sm leading-relaxed text-hf-muted">{content.sub}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-hf-border bg-hf-surface p-5 sm:p-6">
          <p className="text-sm font-medium text-white">{content.sectionTitle}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: content.count }).map((_, index) => (
              <Tile
                key={index}
                src={`/media/library/${(index % 5) + 1}.jpg`}
                className="aspect-[9/16] w-full"
                sizes="(max-width: 640px) 50vw, 20vw"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <div className="flex items-end justify-center gap-2">
        {Array.from({ length: content.tiles ?? 4 }).map((_, index) => (
          <Tile
            key={index}
            src={`/media/tiles/${(index % 4) + 1}.jpg`}
            className="h-24 w-20 sm:h-32 sm:w-26"
            sizes="120px"
          />
        ))}
      </div>
      <div className="mt-7">
        <Headline text={content.headline} highlight={content.highlight} />
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-hf-muted sm:text-base">{content.sub}</p>
    </div>
  );
}

export function ContentTabs() {
  return (
    <div className="mb-6 flex items-center gap-1.5">
      {[
        { label: "History", icon: Folder },
        { label: "How it works", icon: BookOpen },
      ].map(({ label, icon: LucideIcon }, index) => (
        <button
          key={label}
          type="button"
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
            index === 1 ? "bg-hf-surface-3 text-white" : "text-hf-muted hover:text-white"
          }`}
        >
          <LucideIcon className="size-4" aria-hidden strokeWidth={1.75} />
          {label}
        </button>
      ))}
    </div>
  );
}
