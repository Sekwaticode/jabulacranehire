import { useState } from "react";
import ContactDetails from "../components/ContactDetails";
import PageHeader from "../components/PageHeader";
import QuoteForm from "../components/QuoteForm";
import Faqs from "../components/sections/Faqs";
import ServiceArea from "../components/sections/ServiceArea";
import { container, h2Class } from "../components/ui/primitives";
import { equipmentOptions, useContent } from "../content/ContentContext";

// "Get a quote for this" on the Equipment page arrives as ?equipment=<option>.
function equipmentFromUrl(options: string[]) {
  const value = new URLSearchParams(window.location.search).get("equipment");
  return options.find((option) => option === value) ?? "";
}

export default function Contact() {
  const content = useContent();
  const site = content.settings.business;
  const { header, quote, reachUs } = content.pages.contact.sections;
  const [equipment, setEquipment] = useState<string>(() =>
    equipmentFromUrl(equipmentOptions(content.equipment, content.settings.quoteForm.notSureOption)),
  );

  return (
    <>
      <PageHeader {...header} />

      <section className="bg-jch-bg pb-28 text-jch-ink max-[960px]:pb-20 max-[640px]:pb-16">
        <div className={`${container} grid grid-cols-[1.5fr_1fr] items-start gap-8 max-[1100px]:grid-cols-1`}>
          <div id="quote" className="rounded-2xl border border-jch-line bg-jch-panel p-10 max-[640px]:p-6">
            <h2 className={`${h2Class} mb-8 text-[clamp(1.75rem,3vw,2.5rem)]`}>{quote.title}</h2>
            <QuoteForm
              idPrefix="contact-quote"
              equipment={equipment}
              onEquipmentChange={setEquipment}
            />
            <p id="privacy" className="mt-8 border-t border-jch-line pt-6 text-sm leading-[1.6] text-jch-muted">
              <strong className="font-semibold text-jch-ink">{quote.privacyTitle}</strong>{" "}
              {quote.privacyText}
            </p>
          </div>

          <aside className="rounded-2xl border border-jch-line p-10 max-[640px]:p-6">
            <h2 className="mb-8 font-tight text-[13px] font-semibold tracking-[0.22em] text-jch-orange uppercase">
              {reachUs.title}
            </h2>
            <ContactDetails full />
          </aside>
        </div>
      </section>

      <section aria-label="Where to find us" className="bg-jch-bg">
        <iframe
          title={`Map showing the ${site.name} address in Witbank`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[460px] w-full border-0 max-[640px]:h-[340px]"
        />
      </section>

      <ServiceArea />

      <Faqs />
    </>
  );
}
