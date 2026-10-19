// Jabula Crane Hire footer. Its links and text come from the CMS; social
// profile links added there join the Connect column.

import { useContent } from "../content/ContentContext";
import { isExternal, safeHref, safeImageSrc, telHref, whatsappProfileUrl } from "../content/links";

type FooterLinkItem = { label: string; href: string; external?: boolean };

const focusRing =
  "focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jch-orange";

// Uppercase link with an underline that draws in on hover.
const linkBase = `relative inline-block pb-1 leading-[1.2] font-medium tracking-[0.01em] uppercase transition-colors duration-300 ease-jch hover:text-jch-orange focus-visible:text-jch-orange after:absolute after:inset-x-0 after:bottom-0 after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-400 after:ease-jch hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none ${focusRing}`;

const linkSizes = {
  nav: "text-base max-[640px]:text-[15px]",
  legal: "text-[15px] max-[640px]:text-[13px]",
};

function FooterLink({
  link,
  size = "nav",
  businessName,
}: {
  link: FooterLinkItem;
  size?: keyof typeof linkSizes;
  businessName: string;
}) {
  return (
    <a
      href={safeHref(link.href)}
      className={`${linkBase} ${linkSizes[size]}`}
      {...(link.external && {
        target: "_blank",
        rel: "noopener",
        "aria-label": `${businessName} on ${link.label} (opens in a new tab)`,
      })}
    >
      {link.label}
    </a>
  );
}

export default function Footer() {
  const { business, footer, brand } = useContent().settings;
  const navColumns: { heading: string; links: FooterLinkItem[] }[] = [
    ...footer.columns,
    {
      heading: footer.connectHeading,
      links: [
        { label: business.phone.display, href: telHref(business.phone.display) },
        { label: business.mobile.display, href: telHref(business.mobile.display) },
        { label: footer.whatsappLabel, href: whatsappProfileUrl(business), external: true },
        ...footer.social.map((link) => ({ ...link, external: isExternal(link.href) })),
      ],
    },
  ];

  return (
    <footer className="overflow-hidden bg-jch-bg px-[42px] pt-[66px] pb-16 font-tight text-jch-ink antialiased max-[960px]:px-7 max-[960px]:pt-14 max-[640px]:px-4 max-[640px]:py-12">
      {/* Top: navigation columns + logo */}
      <div className="flex items-start justify-between gap-10 max-[640px]:flex-col max-[640px]:gap-11">
        <nav
          aria-label="Footer"
          className="grid grid-cols-[291px_249px_auto] max-[1200px]:grid-cols-[220px_200px_auto] max-[960px]:flex-1 max-[960px]:grid-cols-3 max-[960px]:gap-x-8 max-[640px]:w-full max-[640px]:grid-cols-2 max-[640px]:gap-x-6 max-[640px]:gap-y-10"
        >
          {navColumns.map((column) => (
            <div key={column.heading}>
              <h2 className="sr-only">{column.heading}</h2>
              <ul className="flex flex-col items-start gap-[38px] max-[960px]:gap-[26px] max-[640px]:gap-5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} businessName={business.name} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <a
          href="/"
          aria-label={`${business.name} home`}
          className={`w-[clamp(180px,15vw,280px)] shrink-0 transition-opacity duration-300 ease-jch hover:opacity-85 motion-reduce:transition-none max-[640px]:w-40 ${focusRing}`}
        >
          <img
            src={safeImageSrc(brand.logo.src) || "/logo.png"}
            width={4200}
            height={1440}
            alt={brand.footerLogoAlt}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </a>
      </div>

      {/* Middle: legal + copyright bar */}
      <div className="mt-[150px] flex flex-wrap items-baseline gap-x-[72px] gap-y-4 border-b border-jch-line pb-10 max-[1200px]:gap-x-11 max-[960px]:mt-24 max-[640px]:mt-11 max-[640px]:flex-col max-[640px]:items-start max-[640px]:pb-7">
        <ul className="flex flex-wrap gap-x-[72px] gap-y-4 max-[1200px]:gap-x-11 max-[640px]:gap-x-7 max-[640px]:gap-y-3.5">
          {footer.legal.map((link) => (
            <li key={link.label}>
              <FooterLink link={link} size="legal" businessName={business.name} />
            </li>
          ))}
        </ul>
        <p className="pb-1 text-[15px] font-medium tracking-[0.01em] uppercase max-[640px]:text-[13px]">
          {footer.copyright}
        </p>
      </div>

      {/* Bottom: oversized wordmark + statement */}
      <div className="mt-24 flex items-center justify-between gap-12 max-[960px]:mt-16 max-[960px]:flex-col max-[960px]:items-start max-[640px]:mt-11 max-[640px]:gap-8">
        <p className="flex flex-col font-poppins leading-none">
          <span className="-ml-[0.04em] text-[clamp(72px,11.2vw,230px)] leading-[0.82] font-extrabold tracking-[-0.015em] max-[960px]:text-[18vw] max-[640px]:text-[21vw]">
            JABULA
          </span>
          <span className="mt-[0.75em] flex items-center gap-[0.6em] text-[clamp(18px,2.3vw,46px)] font-semibold tracking-[0.32em] text-jch-muted after:h-[0.1em] after:w-[2.6em] after:bg-jch-orange max-[960px]:text-[4.2vw] max-[640px]:text-[5vw] max-[640px]:tracking-[0.26em]">
            CRANE HIRE
          </span>
        </p>
        <div className="flex max-w-[440px] flex-col items-start gap-[26px]">
          <p className="text-lg leading-[1.6] font-medium uppercase max-[640px]:text-base">
            {footer.statement}
          </p>
          <a
            href={safeHref(footer.cta.href)}
            className={`inline-flex min-h-[46px] items-center justify-center rounded-xl bg-jch-ink px-7 py-3 text-sm font-bold tracking-[0.06em] text-jch-bg uppercase transition-[background-color,translate] duration-300 ease-jch hover:-translate-y-0.5 hover:bg-jch-orange motion-reduce:transition-none max-[640px]:min-h-[52px] max-[640px]:w-full ${focusRing}`}
          >
            {footer.cta.label}
          </a>
        </div>
      </div>
    </footer>
  );
}
