import {
  ArrowRight,
  Building2,
  Check,
  Cog,
  Factory,
  HardHat,
  Phone,
  Pickaxe,
  Plus,
  Route,
  Tractor,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import ContactDetails from "../components/ContactDetails";
import QuoteForm from "../components/QuoteForm";
import ServiceAreaMap from "../components/ServiceAreaMap";
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
import {
  equipment,
  faqs,
  hireOptions,
  industries,
  reasons,
  safetyChecklist,
  site,
  TBC,
  trustFacts,
} from "../data/site";

// Same order as `industries` in site.ts.
const industryIcons = [
  Pickaxe,
  HardHat,
  Cog,
  Factory,
  Wrench,
  Route,
  Building2,
  Tractor,
];

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
  // Shared with the equipment cards so "Get a quote for this" pre-selects it.
  const [quoteEquipment, setQuoteEquipment] = useState("");

  return (
    <>
      {/* 1. Hero */}
      <section className="relative flex min-h-svh w-full items-end overflow-hidden bg-jch-bg text-jch-ink">
        {site.images.hero ? (
          <>
            <img
              src={site.images.hero}
              alt="Mobile crane lifting on site"
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
          <Eyebrow>Witbank-based · {site.provinces.join(", ")}</Eyebrow>
          <h1 className="max-w-[1100px] font-tight text-[clamp(2.5rem,6.4vw,6.25rem)] leading-[0.94] font-semibold tracking-[-0.025em] text-balance uppercase">
            Crane Hire, Forklifts &amp; Telehandlers in Mpumalanga
          </h1>
          <p className="max-w-[46ch] text-xl leading-[1.5] text-jch-muted max-[640px]:text-lg">
            Mobile cranes up to 60 tons for construction, mining and industrial
            projects.
          </p>
          <div className="flex flex-wrap gap-4 max-[640px]:flex-col">
            <a href="#quote" className={btn.primary}>
              Request a Quote
              <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
            </a>
            <a href={site.phone.href} className={btn.outline}>
              <Phone aria-hidden className="size-4" strokeWidth={2.5} />
              Call Now · {site.phone.display}
            </a>
          </div>
        </div>
      </section>

      {/* 2. Trust strip */}
      <section aria-label="At a glance" className="bg-jch-orange text-jch-bg">
        <ul className={`${container} grid grid-cols-4 gap-x-8 gap-y-5 py-8 max-[960px]:grid-cols-2 max-[640px]:py-6`}>
          {trustFacts.map((fact) => (
            <li
              key={fact}
              className="flex items-center border-l-2 border-jch-bg pl-4 font-tight text-lg leading-[1.2] font-bold tracking-[0.01em] uppercase max-[960px]:text-base"
            >
              {fact}
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Our equipment */}
      <section id="equipment" className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-14`}>
          <SectionHeading
            tone="light"
            eyebrow="Our equipment"
            title="The right machine for the lift"
            lead="Three equipment types cover most lifting and material-handling work on site. Tell us the job and we will match the machine to it."
          />
          <div className="grid grid-cols-3 gap-6 max-[1100px]:grid-cols-1">
            {equipment.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-7 rounded-2xl border border-jch-bg/10 bg-white p-9 max-[640px]:p-6"
              >
                <div className="flex flex-col gap-3">
                  <h3 className={h3Class}>{item.title}</h3>
                  <p className="leading-[1.55] text-jch-dim">{item.intro}</p>
                </div>

                <dl className="border-t border-jch-bg/15">
                  {item.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-baseline justify-between gap-4 border-b border-jch-bg/15 py-3"
                    >
                      <dt className="font-tight font-semibold uppercase">{spec.label}</dt>
                      <dd className="text-right text-[15px] text-jch-dim">
                        {"quote" in spec ? (
                          <a
                            href="#quote"
                            onClick={() => setQuoteEquipment(spec.quote)}
                            className="font-semibold text-jch-bg underline decoration-jch-orange decoration-2 underline-offset-4 hover:decoration-jch-bg"
                          >
                            {spec.value || "Check availability"}
                          </a>
                        ) : (
                          spec.value || TBC
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-col gap-3">
                  <p className="font-tight text-[13px] font-semibold tracking-[0.12em] text-jch-dim uppercase">
                    Typical uses
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {item.uses.map((use) => (
                      <CheckItem key={use}>{use}</CheckItem>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-2">
                  {item.note && <p className="text-sm leading-[1.5] text-jch-dim">{item.note}</p>}
                  <a
                    href="#quote"
                    onClick={() => setQuoteEquipment(item.quote)}
                    className={btn.dark}
                  >
                    Get a quote for this
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="text-jch-dim">
            Need something else? Other equipment is available on request.
          </p>
        </div>
      </section>

      {/* 4. Industries we serve */}
      <section className={`bg-jch-bg text-jch-ink ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-14`}>
          <SectionHeading
            eyebrow="Industries we serve"
            title="Built for the sites that keep the region working"
          />
          <ul className="grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-jch-line bg-jch-line max-[1100px]:grid-cols-2 max-[520px]:grid-cols-1">
            {industries.map((industry, i) => {
              const Icon = industryIcons[i];
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

      {/* 5. Why choose Jabula */}
      <section className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-14`}>
          <SectionHeading
            tone="light"
            eyebrow="Why choose Jabula"
            title="Practical, dependable equipment hire"
          />
          <ol className="grid grid-cols-3 gap-x-10 gap-y-12 max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
            {reasons.map((reason, i) => (
              <li key={reason.title} className="flex flex-col gap-3 border-t-2 border-jch-bg pt-5">
                <span className="font-poppins text-sm font-semibold text-jch-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={h3Class}>{reason.title}</h3>
                <p className="leading-[1.55] text-jch-dim">{reason.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. Safety & operators */}
      <section id="safety" className={`bg-jch-bg text-jch-ink ${sectionPad}`}>
        <div className={`${container} grid grid-cols-2 items-stretch gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-10`}>
          <Photo
            src={site.images.safety}
            alt="Operator carrying out a pre-use inspection on a mobile crane"
            caption="Safety first, on every lift."
            className="min-h-[460px] w-full max-[960px]:min-h-[300px]"
          />
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="Safety & operators"
              title="Every lift is planned before it is made"
              lead="Safety is a fundamental part of how we work. We make sure the equipment is right for the job and used the way it should be."
            />
            <ul className="grid grid-cols-2 gap-x-8 gap-y-4 text-lg max-[560px]:grid-cols-1">
              {safetyChecklist.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
            <p className="border-l-2 border-jch-orange pl-5 leading-[1.6] text-jch-muted">
              Where we supply an operator, they are competent and appropriately
              qualified for the machine: they run pre-use checks, work within
              rated capacity, follow your site rules and report any defect or
              unsafe condition.
            </p>
            <a href="/contact#quote" className={`${btn.primary} self-start max-[640px]:self-stretch`}>
              Talk to us about a lift plan
            </a>
          </div>
        </div>
      </section>

      {/* 7. Hire options & how it works */}
      <section id="hire-options" className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-14`}>
          <SectionHeading
            tone="light"
            eyebrow="Hire options"
            title="From a single lift to a long-term contract"
            lead="Flexible hire built around your project. Hire terms are confirmed with your quotation."
          />
          <div className="grid grid-cols-3 gap-6 max-[960px]:grid-cols-1">
            {hireOptions.map((option) => (
              <article key={option.title} className="flex flex-col gap-5 rounded-2xl bg-jch-bg p-9 text-jch-ink max-[640px]:p-6">
                <h3 className={h3Class}>{option.title}</h3>
                <p className="font-tight text-[13px] font-semibold tracking-[0.12em] text-jch-muted uppercase">
                  Suitable for
                </p>
                <ul className="flex flex-col gap-2.5">
                  {option.suitableFor.map((item) => (
                    <CheckItem key={item}>{item}</CheckItem>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <a href="#quote" className={`${btn.dark} self-start max-[640px]:self-stretch`}>
            Request a Quote
            <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
          </a>
        </div>
      </section>

      <Timeline
        title="How a hire works"
        periodLabel="First call to final lift"
        textColor="#ffffff"
        mutedTextColor="#a1a1aa"
        activeColor="#f7802f"
        backgroundColor="#0a0a0a"
        imageUrl="/hero.jpg"
        imageAlt="Jabula Crane Hire logo"
        duration={1.4}
        scroller="#page"
      />

      {/* 8. Service area */}
      <section id="service-area" className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} grid grid-cols-2 items-center gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-12`}>
          <div className="flex flex-col gap-8">
            <SectionHeading
              tone="light"
              eyebrow="Service area"
              title="Mpumalanga first. Gauteng and Limpopo too."
              lead="We work from Witbank, so sites across Mpumalanga are our primary service area, with Gauteng and Limpopo also covered."
            />
            <p className="max-w-[60ch] leading-[1.6] text-jch-dim">
              Further afield? Mobilisation outside these provinces can be
              arranged, subject to project requirements and transport costs.
            </p>
            <a href="#quote" className={`${btn.dark} self-start max-[640px]:self-stretch`}>
              Check if we cover your site
            </a>
          </div>
          <div className="mx-auto w-full max-w-[520px]">
            <ServiceAreaMap />
          </div>
        </div>
      </section>

      {/* 9. FAQs */}
      <section id="faqs" className={`bg-white text-jch-bg ${sectionPad}`}>
        <div className={`${container} grid grid-cols-[1fr_1.4fr] gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-10`}>
          <SectionHeading
            tone="light"
            eyebrow="FAQs"
            title="Questions we get asked"
            lead="Can't see yours? Call us and you will get a straight answer."
          />
          <div className="border-t border-jch-bg/15">
            {faqs.map((faq) => (
              <details key={faq.q} className="group border-b border-jch-bg/15">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-tight text-xl leading-[1.25] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jch-orange max-[640px]:text-lg [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <Plus
                    aria-hidden
                    className="size-6 shrink-0 transition-transform duration-300 ease-jch group-open:rotate-45 motion-reduce:transition-none"
                  />
                </summary>
                <p className="max-w-[62ch] pb-7 text-lg leading-[1.6] text-jch-dim max-[640px]:text-base">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Quote request */}
      <section id="quote" className={`bg-[#0a0a0a] text-jch-ink ${sectionPad}`}>
        <div className={`${container} grid grid-cols-[1fr_1.15fr] gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-12`}>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <Eyebrow>Request a quote</Eyebrow>
              <h2 className={h2Class}>Tell us about the lift</h2>
              <p className="max-w-[48ch] text-lg leading-[1.6] text-jch-muted">
                Send the basics and we will come back with a suitable machine
                and a quotation. In a hurry? Call or WhatsApp.
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
