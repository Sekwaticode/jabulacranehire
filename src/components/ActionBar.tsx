import { FileText, MessageCircle, Phone } from "lucide-react";
import { useContent } from "../content/ContentContext";
import { safeHref, telHref, whatsappUrl } from "../content/links";

// Lives outside #page: that element is transformed while the menu animates,
// which would break `position: fixed` for anything inside it.

const mobileItem =
  "flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 font-tight text-[12px] font-bold tracking-[0.08em] uppercase focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-jch-ink";

export default function ActionBar({ hidden }: { hidden: boolean }) {
  const { business, actionBar } = useContent().settings;
  return (
    <>
      {/* Phones: Call / WhatsApp / Quote pinned to the bottom of the screen */}
      <div
        inert={hidden}
        className={`fixed inset-x-0 bottom-0 z-[5] flex border-t border-jch-line bg-jch-bg pb-[env(safe-area-inset-bottom)] text-jch-ink transition-transform duration-500 ease-jch motion-reduce:transition-none md:hidden ${hidden ? "translate-y-full" : ""}`}
      >
        <a href={telHref(business.phone.display)} className={mobileItem}>
          <Phone aria-hidden className="size-5" />
          {actionBar.call}
        </a>
        <a
          href={whatsappUrl(business)}
          target="_blank"
          rel="noopener"
          className={`${mobileItem} border-x border-jch-line`}
        >
          <MessageCircle aria-hidden className="size-5" />
          {actionBar.whatsapp}
        </a>
        <a href={safeHref(actionBar.quoteHref)} className={`${mobileItem} bg-jch-orange text-jch-bg`}>
          <FileText aria-hidden className="size-5" />
          {actionBar.quote}
        </a>
      </div>

      {/* Desktop: the floating button is the Jotform widget embedded in index.html */}
    </>
  );
}
