import type { ReactNode } from "react";

// Horizontal padding matches the footer so page content lines up with it.
export const container =
  "mx-auto w-full max-w-[1400px] px-[42px] max-[960px]:px-7 max-[640px]:px-4";

export const sectionPad = "py-28 max-[960px]:py-20 max-[640px]:py-16";

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jch-orange";

const btnBase = `inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2.5 rounded-xl px-7 py-3 font-tight text-sm font-bold tracking-[0.06em] uppercase transition-[background-color,color,border-color,translate] duration-300 ease-jch hover:-translate-y-0.5 motion-reduce:transition-none max-[640px]:min-h-[52px] ${focusRing}`;

export const btn = {
  /** Orange, for dark surfaces. */
  primary: `${btnBase} bg-jch-orange text-jch-bg hover:bg-jch-ink`,
  /** Dark, for light and orange surfaces. */
  dark: `${btnBase} bg-jch-bg text-jch-ink hover:bg-jch-orange hover:text-jch-bg`,
  outline: `${btnBase} border border-current hover:border-jch-orange hover:text-jch-orange`,
  /** Pair for orange banners, where an orange hover would disappear. */
  onOrange: `${btnBase} bg-jch-bg text-jch-ink hover:bg-jch-ink hover:text-jch-bg`,
  onOrangeOutline: `${btnBase} border border-current hover:bg-jch-bg hover:text-jch-ink`,
};

export const h2Class =
  "font-tight text-[clamp(2rem,4vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.02em] text-balance uppercase";

type Tone = "dark" | "light";

export function Eyebrow({
  children,
  tone = "dark",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <p
      className={`flex items-center gap-3 font-tight text-[13px] font-semibold tracking-[0.22em] uppercase before:h-0.5 before:w-8 before:shrink-0 before:bg-jch-orange ${tone === "dark" ? "text-jch-muted" : "text-jch-dim"}`}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  tone?: Tone;
}) {
  return (
    <div className="flex max-w-[760px] flex-col gap-5">
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className={h2Class}>{title}</h2>
      {lead && (
        <p
          className={`max-w-[60ch] text-lg leading-[1.6] max-[640px]:text-base ${tone === "dark" ? "text-jch-muted" : "text-jch-dim"}`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

/** A photo slot. Until a photo is supplied it shows a branded panel built
    from the three slashes in the JCH logo, so the layout never has a hole. */
export function Photo({
  src,
  alt,
  caption,
  className = "",
}: {
  src: string;
  alt: string;
  caption: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`rounded-2xl object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-end overflow-hidden rounded-2xl border border-jch-line bg-jch-panel p-10 max-[640px]:p-7 ${className}`}
    >
      <div aria-hidden className="absolute top-10 left-12 flex gap-4 max-[640px]:top-7 max-[640px]:left-9">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-24 w-9 -skew-x-[20deg] bg-jch-orange max-[640px]:h-16 max-[640px]:w-6" />
        ))}
      </div>
      <p className="max-w-[14ch] font-tight text-[clamp(1.75rem,3vw,2.75rem)] leading-none font-semibold tracking-[-0.02em] text-jch-ink uppercase">
        {caption}
      </p>
    </div>
  );
}
