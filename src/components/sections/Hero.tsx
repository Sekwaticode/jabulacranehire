import { ChevronRight, CircleCheck, FileText, Phone } from "lucide-react";
import { Fragment } from "react";
import { container, focusRing } from "../ui/primitives";
import { useContent } from "../../content/ContentContext";
import { safeHref, safeImageSrc, telHref } from "../../content/links";
import { site } from "../../data/site";

// Shown when the CMS has no background photo, or its photo fails to load.
const FALLBACK_PHOTO = site.images.hero;

// Home page hero: full-bleed photo, heading and quote button bottom left,
// equipment card bottom right, then a rule with highlights and the office number.
export default function Hero() {
  const { settings, pages } = useContent();
  const { hero } = pages.home.sections;
  const phone = settings.business.phone.display;
  const card = hero.equipmentCard;
  const cardImage = safeImageSrc(card.image.src);

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-[#0c0d0f] text-white"
    >
      <img
        src={safeImageSrc(hero.image.src) || FALLBACK_PHOTO}
        alt={hero.image.alt}
        fetchPriority="high"
        decoding="async"
        // An old saved version can point at a photo that no longer exists.
        onError={(e) => {
          if (!e.currentTarget.src.endsWith(FALLBACK_PHOTO)) e.currentTarget.src = FALLBACK_PHOTO;
        }}
        className="absolute inset-0 -z-10 size-full object-cover object-[50%_40%]"
      />
      {/* Darkens the bottom and left so the copy stays readable over the photo */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-[#0c0d0f]/95 via-[#0c0d0f]/50 via-35% to-transparent to-70%" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-[#0c0d0f]/55 to-transparent to-60%" />

      <div className={`${container} pt-40 pb-24 max-[640px]:pt-32 max-[640px]:pb-[calc(88px+env(safe-area-inset-bottom))]`}>
        <div className="flex items-end justify-between gap-10 max-[960px]:flex-col max-[960px]:items-start max-[640px]:items-stretch">
          <div className="flex flex-col items-start gap-8 max-[640px]:gap-6">
            <h1
              id="hero-title"
              className="font-tight text-[clamp(2.5rem,4.6vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-balance drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] max-[640px]:text-[clamp(2.1rem,10vw,2.75rem)]"
            >
              {/* One line per sentence. The space keeps the words apart for
                  screen readers and search engines. */}
              {hero.title.split(/(?<=\.)\s+/).map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span className="block">{line}</span>
                </Fragment>
              ))}
            </h1>
            <a
              href={safeHref(hero.primary.href)}
              className={`group inline-flex items-center gap-3 rounded-xl bg-jch-orange py-1.5 pr-5 pl-1.5 font-tight font-semibold text-jch-bg shadow-[0_8px_30px_-6px_rgba(247,128,47,0.55)] transition-colors duration-300 hover:bg-jch-ink max-[640px]:justify-center ${focusRing}`}
            >
              <span className="grid size-10 place-items-center rounded-lg bg-white text-jch-bg">
                <FileText aria-hidden className="size-[18px]" strokeWidth={2.25} />
              </span>
              {hero.primary.label}
            </a>
          </div>

          <a
            href={safeHref(card.link.href)}
            className={`group flex w-[min(100%,400px)] shrink-0 items-stretch gap-4 rounded-2xl border border-white/15 bg-white/10 p-2 pr-5 backdrop-blur-md transition-colors duration-300 hover:bg-white/15 max-[640px]:w-full ${focusRing}`}
          >
            {cardImage && (
              <span className="grid w-[150px] shrink-0 place-items-center overflow-hidden rounded-xl bg-jch-ink max-[400px]:w-[112px]">
                <img
                  src={cardImage}
                  alt={card.image.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-contain p-2 transition-transform duration-500 ease-jch group-hover:scale-105"
                />
              </span>
            )}
            <span className="flex flex-col justify-between gap-4 py-2">
              <span className="font-tight text-lg leading-[1.15] font-semibold tracking-[-0.01em]">{card.title}</span>
              <span className="inline-flex items-center gap-1 font-tight text-sm font-semibold">
                {card.link.label}
                <ChevronRight
                  aria-hidden
                  className="size-4 text-jch-orange transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2.5}
                />
              </span>
            </span>
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-10 gap-y-5 border-t border-white/15 pt-6 max-[640px]:mt-8">
          <ul className="flex flex-wrap gap-x-7 gap-y-3 text-[15px] text-white/75">
            {hero.highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CircleCheck aria-hidden className="size-4 text-jch-orange" strokeWidth={2.25} />
                {item}
              </li>
            ))}
          </ul>
          {/* Phones already have Call in the bottom action bar */}
          <a
            href={telHref(phone)}
            className={`inline-flex items-center max-[640px]:hidden gap-2.5 font-tight text-sm font-semibold tracking-[0.06em] text-white/80 uppercase transition-colors hover:text-jch-orange ${focusRing}`}
          >
            <Phone aria-hidden className="size-4 text-jch-orange" strokeWidth={2.5} />
            {`${hero.callLabel} · ${phone}`}
          </a>
        </div>
      </div>
    </section>
  );
}
