import { useContext } from "react";
import { Check } from "lucide-react";
import EquipmentGrid from "../components/EquipmentGrid";
import PageHeader from "../components/PageHeader";
import CtaBanner from "../components/sections/CtaBanner";
import { container, SectionHeading, sectionPad } from "../components/ui/primitives";
import { equipment } from "../data/site";
import { PageScrollContext } from "../lib/pageScroll";

export default function Equipment() {
  const { navigate } = useContext(PageScrollContext);

  return (
    <>
      <PageHeader
        eyebrow="Equipment"
        title="Cranes, Forklifts & Telehandlers for Hire"
        lead="40-ton to 60-ton mobile cranes, supported by forklifts and telescopic boom handlers. Open a machine to see what it does and get a quote for it."
      />

      <section id="fleet" className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-14`}>
          <SectionHeading
            tone="light"
            eyebrow="Our equipment"
            title="The right machine for the lift"
            lead="Specifications, boom lengths, lifting charts and availability depend on the specific machine and your project, and are confirmed with your quote."
          />
          <EquipmentGrid
            onQuote={(value) =>
              navigate(`/contact?equipment=${encodeURIComponent(value)}#quote`)
            }
          />
        </div>
      </section>

      <section className={`bg-jch-bg text-jch-ink ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-14`}>
          <SectionHeading
            eyebrow="Applications"
            title="What each machine is used for"
          />
          <div className="grid grid-cols-3 gap-6 max-[960px]:grid-cols-1">
            {equipment.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-6 rounded-2xl border border-jch-line bg-jch-panel p-9 max-[640px]:p-6"
              >
                <h3 className="font-tight text-2xl leading-[1.1] font-semibold tracking-[-0.01em] uppercase">
                  {item.title}
                </h3>
                <ul className="flex flex-col gap-2.5 text-jch-muted">
                  {item.applications.map((application) => (
                    <li key={application} className="flex items-start gap-3 leading-[1.4]">
                      <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-jch-orange" strokeWidth={2.5} />
                      {application}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="max-w-[70ch] text-lg leading-[1.6] text-jch-muted">
            Need something that is not listed? Other equipment is available on
            request, and we keep adding to the fleet as clients need it.
          </p>
        </div>
      </section>

      <CtaBanner title="Not sure which machine you need?" />
    </>
  );
}
