import { Check } from "lucide-react";
import PageHeader from "../components/PageHeader";
import CtaBanner from "../components/sections/CtaBanner";
import Teams from "../components/sections/Teams";
import { container, SectionHeading, sectionPad } from "../components/ui/primitives";
import { useContent } from "../content/ContentContext";
import { whatsappUrl } from "../content/links";

export default function Careers() {
  const { settings, pages } = useContent();
  const { header, intro, expectations, cta } = pages.careers.sections;

  return (
    <>
      <PageHeader {...header} />

      <section className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} grid grid-cols-[1fr_1.4fr] gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-8`}>
          <SectionHeading tone="light" eyebrow={intro.eyebrow} title={intro.title} />
          <div className="flex flex-col gap-6 text-xl leading-[1.6] max-[640px]:text-lg">
            {intro.paragraphs.map((paragraph) => (
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
            eyebrow={expectations.eyebrow}
            title={expectations.title}
            lead={expectations.lead}
          />
          <ul className="border-t border-jch-bg/15">
            {expectations.items.map((item) => (
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
        title={cta.title}
        callLabel={cta.callLabel}
        action={{
          label: cta.actionLabel,
          href: whatsappUrl(settings.business, cta.whatsappMessage),
          external: true,
        }}
      />
    </>
  );
}
