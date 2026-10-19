import { ArrowRight, Check, Phone } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import ContactDetails from "../components/ContactDetails";
import EquipmentGrid from "../components/EquipmentGrid";
import QuoteForm from "../components/QuoteForm";
import LogoLoop from "../components/ui/LogoLoop";
import Timeline from "../components/ui/timeline";
import {
  btn,
  container,
  Eyebrow,
  h2Class,
  Photo,
  SectionHeading,
  sectionPad,
} from "../components/ui/primitives";
import { useContent } from "../content/ContentContext";
import { industryIcons } from "../content/icons";
import { safeHref, safeImageSrc, telHref } from "../content/links";
import { PageScrollContext } from "../lib/pageScroll";


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
  const heroImage = safeImageSrc(hero.image.src);

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
      {/* 1. Hero */}
      <section className="relative flex min-h-svh w-full items-end overflow-hidden bg-jch-bg text-jch-ink">
        {heroImage ? (
          <>
            <img
              src={heroImage}
              alt={hero.image.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-jch-bg via-jch-bg/70 to-jch-bg/30" />
          </>
        ) : (
          <div
            aria-hidden
            className="absolute top-[13%] right-[9%] flex gap-[2.2vw] max-[640px]:top-[17%] max-[640px]:right-auto max-[640px]:left-8 max-[640px]:gap-[4vw]"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-[15vw] w-[5.4vw] -skew-x-[20deg] bg-jch-orange max-[640px]:h-[24vw] max-[640px]:w-[9vw]"
              />
            ))}
          </div>
        )}

        <div className={`${container} relative flex flex-col gap-7 pt-44 pb-20 max-[640px]:pb-14`}>
          {/* Split after the last "· " so the text renders exactly as the original two-part eyebrow did. */}
          <Eyebrow>
            {hero.eyebrow.slice(0, hero.eyebrow.lastIndexOf("· ") + 2)}
            {hero.eyebrow.slice(hero.eyebrow.lastIndexOf("· ") + 2)}
          </Eyebrow>
          <h1 className="max-w-[1100px] font-tight text-[clamp(2.5rem,6.4vw,6.25rem)] leading-[0.94] font-semibold tracking-[-0.025em] text-balance uppercase">
            {hero.title}
          </h1>
          <p className="max-w-[46ch] text-xl leading-[1.5] text-jch-muted max-[640px]:text-lg">
            {hero.lead}
          </p>
          <div className="flex flex-wrap gap-4 max-[640px]:flex-col">
            <a href={safeHref(hero.primary.href)} className={btn.primary}>
              {hero.primary.label}
              <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
            </a>
            <a href={telHref(site.phone.display)} className={btn.outline}>
              <Phone aria-hidden className="size-4" strokeWidth={2.5} />
              {`${hero.callLabel} · `}{site.phone.display}
            </a>
          </div>
        </div>
      </section>

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
