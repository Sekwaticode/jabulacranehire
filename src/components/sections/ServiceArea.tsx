import { useContent } from "../../content/ContentContext";
import { safeHref } from "../../content/links";
import ServiceAreaMap from "../ServiceAreaMap";
import { btn, container, SectionHeading, sectionPad } from "../ui/primitives";

export default function ServiceArea() {
  const { eyebrow, title, lead, note, button: cta } = useContent().pages.contact.sections.serviceArea;
  return (
    <section id="service-area" className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
      <div className={`${container} grid grid-cols-2 items-center gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-12`}>
        <div className="flex flex-col gap-8">
          <SectionHeading
            tone="light"
            eyebrow={eyebrow}
            title={title}
            lead={lead}
          />
          <p className="max-w-[60ch] leading-[1.6] text-jch-dim">
            {note}
          </p>
          <a href={safeHref(cta.href)} className={`${btn.dark} self-start max-[640px]:self-stretch`}>
            {cta.label}
          </a>
        </div>
        <div className="mx-auto w-full max-w-[520px]">
          <ServiceAreaMap />
        </div>
      </div>
    </section>
  );
}
