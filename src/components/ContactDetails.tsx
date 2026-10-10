import type { ReactNode } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { site, whatsappUrl } from "../data/site";

const linkClass =
  "font-semibold text-jch-ink transition-colors duration-300 ease-jch hover:text-jch-orange focus-visible:text-jch-orange focus-visible:outline-none";

function Row({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-4 border-t border-jch-line py-5 first:border-t-0 first:pt-0 last:pb-0">
      <span aria-hidden className="mt-0.5 text-jch-orange [&_svg]:size-5">
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <span className="font-tight text-[13px] font-semibold tracking-[0.08em] text-jch-muted uppercase">
          {label}
        </span>
        <div className="text-lg leading-[1.45]">{children}</div>
      </div>
    </li>
  );
}

/** Every way to reach Jabula. `full` adds the address and operating hours. */
export default function ContactDetails({ full = false }: { full?: boolean }) {
  return (
    <ul className="flex flex-col">
      <Row icon={<Phone />} label="Call the office">
        <a href={site.phone.href} className={linkClass}>
          {site.phone.display}
        </a>
      </Row>
      <Row icon={<Phone />} label="Mobile and after hours">
        <a href={site.mobile.href} className={linkClass}>
          {site.mobile.display}
        </a>
      </Row>
      <Row icon={<MessageCircle />} label="WhatsApp">
        <a href={whatsappUrl()} target="_blank" rel="noopener" className={linkClass}>
          Chat to us on {site.mobile.display}
        </a>
      </Row>
      {site.email && (
        <Row icon={<Mail />} label="Email">
          <a href={`mailto:${site.email}`} className={`${linkClass} break-all`}>
            {site.email}
          </a>
        </Row>
      )}
      {full && (
        <>
          <Row icon={<MapPin />} label="Address">
            <address className="text-jch-ink not-italic">
              {site.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </Row>
          <Row icon={<Clock />} label="Operating hours">
            <span className="block text-jch-ink">{site.hours}</span>
            <span className="block text-base text-jch-muted">
              After hours and emergencies: {site.mobile.display}
            </span>
          </Row>
        </>
      )}
    </ul>
  );
}
