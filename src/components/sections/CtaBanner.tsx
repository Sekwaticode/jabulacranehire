import { ArrowRight, Phone } from "lucide-react";
import { site } from "../../data/site";
import { btn, container, h2Class } from "../ui/primitives";

/** Orange closing banner: a phone button plus one other action. */
export default function CtaBanner({
  title = "Need a crane this week?",
  action = { label: "Request a Quote", href: "/contact#quote" },
}: {
  title?: string;
  action?: { label: string; href: string; external?: boolean };
}) {
  return (
    <section className="bg-jch-orange py-20 text-jch-bg max-[640px]:py-14">
      <div className={`${container} flex flex-wrap items-center justify-between gap-8`}>
        <h2 className={h2Class}>{title}</h2>
        <div className="flex flex-wrap gap-4 max-[640px]:w-full max-[640px]:flex-col">
          <a href={site.phone.href} className={btn.onOrangeOutline}>
            <Phone aria-hidden className="size-4" strokeWidth={2.5} />
            Call {site.phone.display}
          </a>
          <a
            href={action.href}
            className={btn.onOrange}
            {...(action.external && { target: "_blank", rel: "noopener" })}
          >
            {action.label}
            <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
}
