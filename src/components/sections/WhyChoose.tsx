import { useContent } from "../../content/ContentContext";
import { container, SectionHeading, sectionPad } from "../ui/primitives";
import Reveal from "../ui/Reveal";

export default function WhyChoose() {
  const { eyebrow, title, reasons } = useContent().pages.about.sections.whyChoose;
  return (
    <section id="why-jabula" className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
      <div className={`${container} flex flex-col gap-14`}>
        <SectionHeading
          tone="light"
          eyebrow={eyebrow}
          title={title}
        />
        <Reveal as="ol" stagger={0.08} className="grid grid-cols-3 gap-x-10 gap-y-12 max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
          {reasons.map((reason, i) => (
            <li key={reason.title} className="flex flex-col gap-3 border-t-2 border-jch-bg pt-5">
              <span className="font-poppins text-sm font-semibold text-jch-dim">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-tight text-2xl leading-[1.1] font-semibold tracking-[-0.01em] uppercase">
                {reason.title}
              </h3>
              <p className="leading-[1.55] text-jch-dim">{reason.text}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
