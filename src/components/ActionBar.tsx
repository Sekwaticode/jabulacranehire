import { FileText, MessageCircle, Phone } from "lucide-react";
import { site, whatsappUrl } from "../data/site";

// Lives outside #page: that element is transformed while the menu animates,
// which would break `position: fixed` for anything inside it.

const mobileItem =
  "flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 font-tight text-[12px] font-bold tracking-[0.08em] uppercase focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-jch-ink";

export default function ActionBar({ hidden }: { hidden: boolean }) {
  return (
    <>
      {/* Phones: Call / WhatsApp / Quote pinned to the bottom of the screen */}
      <div
        inert={hidden}
        className={`fixed inset-x-0 bottom-0 z-[5] flex border-t border-jch-line bg-jch-bg pb-[env(safe-area-inset-bottom)] text-jch-ink transition-transform duration-500 ease-jch motion-reduce:transition-none md:hidden ${hidden ? "translate-y-full" : ""}`}
      >
        <a href={site.phone.href} className={mobileItem}>
          <Phone aria-hidden className="size-5" />
          Call
        </a>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener"
          className={`${mobileItem} border-x border-jch-line`}
        >
          <MessageCircle aria-hidden className="size-5" />
          WhatsApp
        </a>
        <a href="/contact#quote" className={`${mobileItem} bg-jch-orange text-jch-bg`}>
          <FileText aria-hidden className="size-5" />
          Quote
        </a>
      </div>

      {/* Desktop: floating WhatsApp button */}
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener"
        inert={hidden}
        aria-label={`WhatsApp Jabula Crane Hire on ${site.mobile.display} (opens in a new tab)`}
        className={`fixed right-6 bottom-6 z-[5] hidden items-center gap-3 rounded-full bg-jch-orange py-3.5 pr-6 pl-5 font-tight text-sm font-bold tracking-[0.06em] text-jch-bg uppercase shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-[opacity,translate,background-color] duration-300 ease-jch hover:-translate-y-0.5 hover:bg-jch-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jch-orange motion-reduce:transition-none md:flex ${hidden ? "pointer-events-none opacity-0" : ""}`}
      >
        <MessageCircle aria-hidden className="size-5" strokeWidth={2.25} />
        WhatsApp us
      </a>
    </>
  );
}
