import { Check } from "lucide-react";
import PageHeader from "../components/PageHeader";
import CtaBanner from "../components/sections/CtaBanner";
import Teams from "../components/sections/Teams";
import { container, SectionHeading, sectionPad } from "../components/ui/primitives";
import { careers, whatsappUrl } from "../data/site";

export default function Careers() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Work With Jabula Crane Hire"
        lead="Safe, reliable lifting starts with the people who operate, maintain and support the equipment."
      />

      <section className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} grid grid-cols-[1fr_1.4fr] gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-8`}>
          <SectionHeading tone="light" eyebrow="Working here" title="People who take the lift seriously" />
          <div className="flex flex-col gap-6 text-xl leading-[1.6] max-[640px]:text-lg">
            {careers.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <Teams />

      <section className={`bg-white text-jch-bg ${sectionPad}`}>
        <div className={`${container} grid grid-cols-[1fr_1.4fr] gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-10`}>
          <SectionHeading
            tone="light"
            eyebrow="On site"
            title="What we expect of everyone"
            lead="The same standards apply on every client site, whatever the machine."
          />
          <ul className="border-t border-jch-bg/15">
            {careers.expectations.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 border-b border-jch-bg/15 py-5 text-xl leading-[1.4] max-[640px]:text-lg"
              >
                <Check aria-hidden className="mt-1 size-5 shrink-0 text-jch-orange" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBanner
        title="Want to work with us?"
        action={{
          label: "WhatsApp us",
          href: whatsappUrl("Hi Jabula, I'd like to ask about work opportunities."),
          external: true,
        }}
      />
    </>
  );
}
