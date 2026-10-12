import { useState } from "react";
import ContactDetails from "../components/ContactDetails";
import PageHeader from "../components/PageHeader";
import QuoteForm from "../components/QuoteForm";
import Faqs from "../components/sections/Faqs";
import ServiceArea from "../components/sections/ServiceArea";
import { container, h2Class } from "../components/ui/primitives";
import { equipmentOptions, site } from "../data/site";

// "Get a quote for this" on the Equipment page arrives as ?equipment=<option>.
function equipmentFromUrl() {
  const value = new URLSearchParams(window.location.search).get("equipment");
  return equipmentOptions.find((option) => option === value) ?? "";
}

export default function Contact() {
  const [equipment, setEquipment] = useState<string>(equipmentFromUrl);

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Request a Quote or Call Us"
        lead="Tell us about the lift and we will recommend the machine and send a quotation. For anything urgent, pick up the phone."
      />

      <section className="bg-jch-bg pb-28 text-jch-ink max-[960px]:pb-20 max-[640px]:pb-16">
        <div className={`${container} grid grid-cols-[1.5fr_1fr] items-start gap-8 max-[1100px]:grid-cols-1`}>
          <div id="quote" className="rounded-2xl border border-jch-line bg-jch-panel p-10 max-[640px]:p-6">
            <h2 className={`${h2Class} mb-8 text-[clamp(1.75rem,3vw,2.5rem)]`}>Quote request</h2>
            <QuoteForm
              idPrefix="contact-quote"
              equipment={equipment}
              onEquipmentChange={setEquipment}
            />
            <p id="privacy" className="mt-8 border-t border-jch-line pt-6 text-sm leading-[1.6] text-jch-muted">
              <strong className="font-semibold text-jch-ink">Privacy notice (POPIA).</strong>{" "}
              We use the details you send only to respond to your enquiry and
              prepare your quotation. You can ask us to update or delete them
              at any time.
            </p>
          </div>

          <aside className="rounded-2xl border border-jch-line p-10 max-[640px]:p-6">
            <h2 className="mb-8 font-tight text-[13px] font-semibold tracking-[0.22em] text-jch-orange uppercase">
              Reach us directly
            </h2>
            <ContactDetails full />
          </aside>
        </div>
      </section>

      <section aria-label="Where to find us" className="bg-jch-bg">
        <iframe
          title="Map showing the Jabula Crane Hire address in Witbank"
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
