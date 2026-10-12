import ServiceAreaMap from "../ServiceAreaMap";
import { btn, container, SectionHeading, sectionPad } from "../ui/primitives";

export default function ServiceArea({
  cta = { label: "Check if we cover your site", href: "#quote" },
}: {
  cta?: { label: string; href: string };
}) {
  return (
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
          <a href={cta.href} className={`${btn.dark} self-start max-[640px]:self-stretch`}>
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
