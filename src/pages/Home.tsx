import { ArrowRight, Check, Phone } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import ContactDetails from "../components/ContactDetails";
import EquipmentGrid from "../components/EquipmentGrid";
import QuoteForm from "../components/QuoteForm";
import LogoLoop from "../components/ui/LogoLoop";
import ParallaxScrolling from "../components/ui/parallax-scrolling";
import Timeline from "../components/ui/timeline";
import {
  btn,
  container,
  Eyebrow,
  focusRing,
  h2Class,
  Photo,
  SectionHeading,
  sectionPad,
} from "../components/ui/primitives";
import { useContent } from "../content/ContentContext";
import { industryIcons } from "../content/icons";
import { safeHref, safeImageSrc, telHref } from "../content/links";
import { PageScrollContext } from "../lib/pageScroll";


// The hero's crane is fixed; its backdrop is the CMS photo, or this one.
const CRANE_SRC = "/Liebherr_Crane_Truck.png";
const HERO_FALLBACK_SRC = "/images/hero-site.jpg";

const h3Class =
  "font-tight text-2xl leading-[1.1] font-semibold tracking-[-0.01em] uppercase";

function CheckItem({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-3 leading-[1.4]">
      <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-jch-orange" strokeWidth={2.5} />
      {children}
    </li>
  );
}

export default function Home() {
  // Set by the equipment dialog so "Get a quote for this" pre-selects it.
  const [quoteEquipment, setQuoteEquipment] = useState("");
  const { scrollToHash } = useContext(PageScrollContext);
  const { settings, pages } = useContent();
  const site = settings.business;
  const { hero, trust, equipment, industries, safety, hireOptions, process, quote } = pages.home.sections;
  const heroImage = safeImageSrc(hero.image.src) || HERO_FALLBACK_SRC;

  // LogoLoop is memoised on its `logos` array. Each fact is followed by a
  // slash from the JCH logo, which separates it from the next one.
  const trustLogos = useMemo(
    () =>
      trust.items.map((fact) => ({
        title: fact,
        node: (
          <span className="flex items-center gap-9 font-tight font-bold tracking-[0.01em] whitespace-nowrap uppercase">
            {fact}
            <span aria-hidden className="h-[0.9em] w-[0.34em] -skew-x-[20deg] bg-jch-bg" />
          </span>
        ),
      })),
    [trust.items],
  );

  return (
    <>
      {/* 1. Hero. Layers back to front: site photo, haze, crane, ground fade.
          From 1024px the copy sits left of the crane; below it they stack. */}
      <ParallaxScrolling
        scroller="#page"
        aria-labelledby="hero-title"
        className="relative isolate flex min-h-svh w-full flex-col overflow-hidden bg-[#0c0d0f] text-jch-ink min-[1024px]:justify-center"
      >
        <div
          aria-hidden
          data-parallax-layer
          data-parallax-y="16"
          className="absolute inset-x-0 -top-[4%] -z-10 h-[116%]"
        >
          <img
            src={heroImage}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="size-full scale-105 object-cover object-[50%_35%] blur-[1.5px] brightness-[0.5] contrast-[1.2] grayscale-[0.85]"
          />
          {/* Overcast sky: heavy at the top, thinning toward the horizon */}
          <div className="absolute inset-0 bg-linear-to-b from-[#0c0d0f]/85 via-[#0c0d0f]/25 via-45% to-[#0c0d0f]/60" />
        </div>

        <div
          aria-hidden
          data-parallax-layer
          data-parallax-y="8"
          data-parallax-mobile="off"
          className="absolute inset-0 -z-10"
        >
          {/* Keeps the copy legible: from the left on desktop, from the top below it */}
          <div className="absolute inset-0 bg-linear-to-r from-[#0c0d0f]/95 via-[#0c0d0f]/70 via-40% to-transparent to-75% max-[1023px]:bg-linear-to-b max-[1023px]:from-[#0c0d0f]/90 max-[1023px]:via-[#0c0d0f]/60 max-[1023px]:via-50%" />
          {/* Dust hanging low over the site, warmed where the crane stands */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_72%_78%,rgba(247,128,47,0.14),transparent_70%),radial-gradient(ellipse_90%_28%_at_55%_92%,rgba(185,182,175,0.1),transparent_70%)] max-[1023px]:bg-[radial-gradient(ellipse_90%_35%_at_60%_85%,rgba(247,128,47,0.14),transparent_70%)]" />
        </div>

        <div
          data-parallax-layer
          data-parallax-y="-12"
          data-parallax-opacity="0"
          className={`${container} relative z-30 flex flex-col gap-7 pt-36 pb-16 max-[1023px]:pt-32 max-[1023px]:pb-0 max-[640px]:gap-5 max-[640px]:pt-24`}
        >
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1
            id="hero-title"
            className="max-w-[min(640px,44vw)] font-tight text-[clamp(2.5rem,4.6vw,5rem)] leading-[0.95] font-semibold tracking-[-0.025em] text-balance uppercase max-[1023px]:max-w-[640px] max-[640px]:text-[clamp(2rem,9.6vw,2.75rem)]"
          >
            {/* One line per sentence; the last one takes the brand orange. */}
            {hero.title.split(/(?<=\.)\s+/).map((line, i, lines) => (
              <span key={i} className={`block ${i > 0 && i === lines.length - 1 ? "text-jch-orange" : ""}`}>
                {line}
              </span>
            ))}
          </h1>
          <p className="max-w-[min(46ch,40vw)] text-lg leading-[1.55] text-jch-muted max-[1023px]:max-w-[52ch] max-[640px]:text-base">
            {hero.lead}
          </p>
          <div className="flex flex-wrap gap-4 max-[640px]:flex-col">
            <a href={safeHref(hero.primary.href)} className={btn.primary}>
              {hero.primary.label}
              <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
            </a>
            <a href={safeHref(hero.secondary.href)} className={btn.outline}>
              {hero.secondary.label}
            </a>
          </div>
          {/* Phones already have Call in the bottom action bar */}
          <a
            href={telHref(site.phone.display)}
            className={`inline-flex items-center max-[640px]:hidden gap-2.5 self-start font-tight text-sm font-semibold tracking-[0.06em] text-jch-muted uppercase transition-colors hover:text-jch-orange ${focusRing}`}
          >
            <Phone aria-hidden className="size-4 text-jch-orange" strokeWidth={2.5} />
            {`${hero.callLabel} · `}{site.phone.display}
          </a>
        </div>

        {/* The crane: beside the copy on desktop, under it below 1024px */}
        <div
          data-parallax-layer
          data-parallax-y="8"
          className="pointer-events-none absolute right-[-1.5vw] bottom-[8%] w-[min(50vw,940px)] min-[1280px]:w-[min(54vw,1000px)] max-[1023px]:relative max-[1023px]:right-auto max-[1023px]:bottom-auto max-[1023px]:mt-auto max-[1023px]:ml-auto max-[1023px]:w-[min(88vw,640px)] max-[1023px]:translate-x-[3%] max-[1023px]:pt-6 max-[1023px]:pb-[6svh] max-[640px]:w-[100vw] max-[640px]:translate-x-[5%] max-[640px]:pt-2 max-[640px]:pb-[calc(64px+env(safe-area-inset-bottom))]"
        >
          <div aria-hidden className="absolute inset-x-[10%] bottom-[4%] h-[9%] rounded-[50%] bg-black/80 blur-2xl max-[1023px]:bottom-[calc(6svh+4%)] max-[640px]:bottom-[calc(64px+4%)]" />
          <img
            src={CRANE_SRC}
            alt="Yellow Liebherr all-terrain mobile crane with its telescopic boom and hook block"
            width={612}
            height={408}
            fetchPriority="high"
            decoding="async"
            className="relative h-auto w-full"
          />
        </div>

        {/* Ground fade: rises over the crane's base as the page scrolls on */}
        <div
          aria-hidden
          data-parallax-layer
          data-parallax-y="-62"
          className="absolute inset-x-0 bottom-0 z-20 h-[70%] translate-y-[62%] bg-linear-to-t from-[#0c0d0f] from-35% via-[#0c0d0f]/70 via-50% to-transparent"
        />
      </ParallaxScrolling>

      {/* 2. Trust strip */}
      <section className="overflow-hidden bg-jch-orange py-7 text-jch-bg max-[640px]:py-5">
        <LogoLoop
          logos={trustLogos}
          speed={70}
          direction="left"
          logoHeight={20}
          gap={36}
          hoverSpeed={0}
          fadeOut
          fadeOutColor="#f7802f"
          ariaLabel="At a glance"
        />
      </section>

      {/* 3. Our equipment */}
      <section id="equipment" className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-14`}>
          <SectionHeading
            tone="light"
            eyebrow={equipment.eyebrow}
            title={equipment.title}
            lead={equipment.lead}
          />
          <EquipmentGrid
            onQuote={(value) => {
              setQuoteEquipment(value);
              scrollToHash("#quote");
            }}
          />
          <a href={safeHref(equipment.button.href)} className={`${btn.dark} self-start max-[640px]:self-stretch`}>
            {equipment.button.label}
            <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
          </a>
        </div>
      </section>

      {/* 4. Industries we serve */}
      <section className={`bg-jch-bg text-jch-ink ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-14`}>
          <SectionHeading
            eyebrow={industries.eyebrow}
            title={industries.title}
          />
          <ul className="grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-jch-line bg-jch-line max-[1100px]:grid-cols-2 max-[520px]:grid-cols-1">
            {industries.items.map((industry) => {
              const Icon = (industryIcons[industry.icon] ?? industryIcons.wrench).icon;
              return (
                <li key={industry.name} className="flex flex-col gap-4 bg-jch-bg p-8 max-[640px]:p-6">
                  <Icon aria-hidden className="size-7 text-jch-orange" strokeWidth={1.75} />
                  <h3 className="font-tight text-xl font-semibold uppercase">{industry.name}</h3>
                  <p className="leading-[1.5] text-jch-muted">{industry.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 5. Safety & operators */}
      <section id="safety" className={`bg-white text-jch-bg ${sectionPad}`}>
        <div className={`${container} grid grid-cols-2 items-stretch gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-10`}>
          <Photo
            src={safeImageSrc(safety.photo.src)}
            alt={safety.photo.alt}
            caption={safety.caption}
            className="min-h-[460px] w-full max-[960px]:min-h-[300px]"
          />
          <div className="flex flex-col gap-8">
            <SectionHeading
              tone="light"
              eyebrow={safety.eyebrow}
              title={safety.title}
              lead={safety.lead}
            />
            <ul className="grid grid-cols-2 gap-x-8 gap-y-4 text-lg max-[560px]:grid-cols-1">
              {safety.checklist.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
            <p className="border-l-2 border-jch-orange pl-5 leading-[1.6] text-jch-dim">
              {safety.operatorNote}
            </p>
            <a href={safeHref(safety.button.href)} className={`${btn.dark} self-start max-[640px]:self-stretch`}>
              {safety.button.label}
            </a>
          </div>
        </div>
      </section>

      {/* 6. Hire options & how it works */}
      <section id="hire-options" className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-14`}>
          <SectionHeading
            tone="light"
            eyebrow={hireOptions.eyebrow}
            title={hireOptions.title}
            lead={hireOptions.lead}
          />
          <div className="grid grid-cols-3 gap-6 max-[960px]:grid-cols-1">
            {hireOptions.options.map((option) => (
              <article key={option.title} className="flex flex-col gap-5 rounded-2xl bg-jch-bg p-9 text-jch-ink max-[640px]:p-6">
                <h3 className={h3Class}>{option.title}</h3>
                <p className="font-tight text-[13px] font-semibold tracking-[0.12em] text-jch-muted uppercase">
                  {hireOptions.suitableForLabel}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {option.suitableFor.map((item) => (
                    <CheckItem key={item}>{item}</CheckItem>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <a href={safeHref(hireOptions.button.href)} className={`${btn.dark} self-start max-[640px]:self-stretch`}>
            {hireOptions.button.label}
            <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
          </a>
        </div>
      </section>

      <Timeline
        title={process.title}
        periodLabel={process.periodLabel}
        steps={process.steps}
        textColor="#ffffff"
        mutedTextColor="#a1a1aa"
        activeColor="#f7802f"
        backgroundColor="#0a0a0a"
        imageUrl={safeImageSrc(process.image.src) || "/hero.jpg"}
        imageAlt={process.image.alt}
        duration={1.4}
        scroller="#page"
      />

      {/* 7. Quote request */}
      <section id="quote" className={`border-t border-jch-line bg-[#0a0a0a] text-jch-ink ${sectionPad}`}>
        <div className={`${container} grid grid-cols-[1fr_1.15fr] gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-12`}>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <Eyebrow>{quote.eyebrow}</Eyebrow>
              <h2 className={h2Class}>{quote.title}</h2>
              <p className="max-w-[48ch] text-lg leading-[1.6] text-jch-muted">
                {quote.intro}
              </p>
            </div>
            <ContactDetails />
          </div>
          <div className="rounded-2xl border border-jch-line bg-jch-panel p-10 max-[640px]:p-6">
            <QuoteForm
              compact
              idPrefix="home-quote"
              equipment={quoteEquipment}
              onEquipmentChange={setQuoteEquipment}
            />
          </div>
        </div>
      </section>
    </>
  );
}
