import { useRef } from "react";
import { safeImageSrc } from "../content/links";
import type { Img } from "../content/types";
import { container, Eyebrow } from "./ui/primitives";
import { useHeadingReveal } from "./ui/Reveal";

/** Top-of-page banner for About and Contact. Sits behind the fixed navbar,
    so the top padding clears it. */
export default function PageHeader({
  eyebrow,
  title,
  lead,
  image,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  image?: Img;
}) {
  const src = safeImageSrc(image?.src ?? "");
  const ref = useRef<HTMLElement>(null);
  // Already on screen, so it plays straight away rather than on scroll.
  useHeadingReveal(ref, { onScroll: false, key: title });
  return (
    <header ref={ref} className="relative overflow-hidden bg-jch-bg text-jch-ink">
      {src ? (
        <>
          <img src={src} alt={image?.alt ?? ""} className="absolute inset-0 h-full w-full animate-[jch-settle_1.8s_var(--ease-jch)_both] object-cover motion-reduce:animate-none" />
          <div className="absolute inset-0 bg-linear-to-t from-jch-bg via-jch-bg/80 to-jch-bg/50" />
        </>
      ) : (
        <div aria-hidden className="absolute top-36 right-[8%] flex gap-[1.6vw] max-[960px]:hidden">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ animationDelay: `${0.15 + i * 0.12}s` }}
              className="h-[9vw] w-[3.2vw] -skew-x-[20deg] animate-[jch-slash-in_1.1s_var(--ease-jch)_both] bg-jch-orange motion-reduce:animate-none"
            />
          ))}
        </div>
      )}
      <div className={`${container} relative flex flex-col gap-6 pt-48 pb-24 max-[640px]:pt-40 max-[640px]:pb-16`}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 data-reveal-title className="max-w-[18ch] font-tight text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.025em] text-balance uppercase">
          {title}
        </h1>
        <p data-reveal-fade className="max-w-[56ch] text-xl leading-[1.55] text-jch-muted max-[640px]:text-lg">
          {lead}
        </p>
      </div>
    </header>
  );
}
