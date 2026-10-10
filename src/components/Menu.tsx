import type { Ref } from "react";

const menuColumns = [
  [
    { label: "Home", href: "/" },
    { label: "Equipment", href: "/#equipment" },
    { label: "About", href: "/about" },
  ],
  [
    { label: "Contact", href: "/contact" },
    { label: "Request a Quote", href: "/contact#quote" },
    { label: "FAQs", href: "/#faqs" },
  ],
  [
    { label: "Hire Options", href: "/#hire-options" },
    { label: "Service Area", href: "/#service-area" },
    { label: "Call 013 241 1017", href: "tel:+27132411017" },
  ],
];

// `.word` spans are injected by GSAP SplitText, so they're styled from the link.
// A raw `transform` (not Tailwind's `translate`) so GSAP can animate it.
const linkClass =
  "block text-[2.5rem] leading-[1.25] font-medium tracking-[-0.01em] text-white no-underline max-[1000px]:text-[1.75rem] [&_.word]:relative [&_.word]:[transform:translateY(100%)] [&_.word]:will-change-transform";

export default function Menu({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 h-svh w-full overflow-hidden bg-[#0a0a0a]"
    >
      <div className="absolute top-0 left-0 flex h-[50svh] w-full gap-10 px-10 pt-24 pb-10 max-[1000px]:h-[65svh] max-[1000px]:flex-col max-[1000px]:gap-0">
        {menuColumns.map((links, col) => (
          <div
            key={col}
            data-menu-col
            className="flex h-full flex-1 flex-col justify-center"
          >
            {links.map((link) => (
              <a key={link.label} href={link.href} className={linkClass}>
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
