import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { faqs } from "../../data/site";
import { container, SectionHeading, sectionPad } from "../ui/primitives";

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();

  return (
    <section id="faqs" className={`bg-white text-jch-bg ${sectionPad}`}>
      <div className={`${container} flex flex-col gap-14 max-[640px]:gap-10`}>
        <SectionHeading
          tone="light"
          eyebrow="FAQs"
          title="Questions we get asked"
          lead="Can't see yours? Call us and you will get a straight answer."
        />

        <div>
          {faqs.map((faq, index) => {
            const isOpen = index === openIndex;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div
                key={faq.q}
                className="group/faq relative isolate border-t border-dotted border-jch-bg/40 last:border-b"
              >
                {/* Fill that rises from the bottom edge on hover and while open */}
                <div
                  aria-hidden
                  className={`absolute bottom-0 left-0 -z-10 w-full bg-[#e9e6df] transition-[height] duration-700 ease-jch group-hover/faq:h-full motion-reduce:transition-none ${isOpen ? "h-full" : "h-0"}`}
                />

                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-4 py-6 text-left transition-[padding] duration-700 ease-jch focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-jch-orange motion-reduce:transition-none md:py-8 lg:group-hover/faq:px-8 ${isOpen ? "lg:px-8" : ""}`}
                  >
                    <span className="font-tight text-2xl leading-[1.15] font-semibold tracking-[-0.01em] md:text-3xl">
                      {faq.q}
                    </span>
                    <span
                      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-jch-bg/40 transition-transform duration-700 ease-jch motion-reduce:transition-none ${isOpen ? "rotate-45" : ""}`}
                    >
                      <Plus aria-hidden className="size-6" strokeWidth={1.5} />
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="overflow-hidden lg:px-8"
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.7, ease: "easeOut" }}
                    >
                      <p className="max-w-[62ch] pb-8 text-xl leading-[1.55] text-jch-dim max-[640px]:text-lg">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
