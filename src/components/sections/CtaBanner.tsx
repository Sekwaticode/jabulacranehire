import { ArrowRight, Phone } from "lucide-react";
import { useContent } from "../../content/ContentContext";
import { isExternal, safeHref, telHref } from "../../content/links";
import { btn, container, h2Class } from "../ui/primitives";

/** Orange closing banner: a phone button plus one other action. */
export default function CtaBanner({
  title,
  callLabel,
  action,
}: {
  title: string;
  callLabel: string;
  action: { label: string; href: string; external?: boolean };
}) {
  const { phone } = useContent().settings.business;
  const external = action.external ?? isExternal(action.href);
  return (
    <section className="bg-jch-orange py-20 text-jch-bg max-[640px]:py-14">
      <div className={`${container} flex flex-wrap items-center justify-between gap-8`}>
        <h2 className={h2Class}>{title}</h2>
        <div className="flex flex-wrap gap-4 max-[640px]:w-full max-[640px]:flex-col">
          <a href={telHref(phone.display)} className={btn.onOrangeOutline}>
            <Phone aria-hidden className="size-4" strokeWidth={2.5} />
            {`${callLabel} `}{phone.display}
          </a>
          <a
            href={safeHref(action.href)}
            className={btn.onOrange}
            {...(external && { target: "_blank", rel: "noopener" })}
          >
            {action.label}
            <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
}
