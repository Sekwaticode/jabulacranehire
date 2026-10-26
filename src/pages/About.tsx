import { Check, Download } from "lucide-react";
import PageHeader from "../components/PageHeader";
import CtaBanner from "../components/sections/CtaBanner";
import WhoWeAre from "../components/sections/WhoWeAre";
import WhyChoose from "../components/sections/WhyChoose";
import Reveal from "../components/ui/Reveal";
import {
  btn,
  container,
  SectionHeading,
  sectionPad,
} from "../components/ui/primitives";
import { useContent } from "../content/ContentContext";
import { safeHref } from "../content/links";

const cardClass =
  "flex flex-col gap-5 rounded-2xl border border-jch-line bg-jch-panel p-10 max-[640px]:p-6";
const cardTitle =
  "font-tight text-[13px] font-semibold tracking-[0.22em] text-jch-orange uppercase";

export default function About() {
  const { settings, pages } = useContent();
  const { header, visionMission, commitment, quality, clients, credentials, cta } = pages.about.sections;
  const { rows, companyProfilePdf } = settings.credentials;

  return (
    <>
      <PageHeader {...header} />

      <WhoWeAre />

      {/* Vision and mission */}
      <section className={`bg-jch-bg text-jch-ink ${sectionPad}`}>
        <Reveal stagger={0.12} className={`${container} grid grid-cols-2 gap-6 max-[960px]:grid-cols-1`}>
          <article className={cardClass}>
            <h2 className={cardTitle}>{visionMission.visionLabel}</h2>
            <p className="font-tight text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.25] font-medium tracking-[-0.01em]">
              {visionMission.vision}
            </p>
          </article>
          <article className={cardClass}>
            <h2 className={cardTitle}>{visionMission.missionLabel}</h2>
            <p className="text-lg leading-[1.6]">{visionMission.mission}</p>
            <p className="font-tight text-[13px] font-semibold tracking-[0.12em] text-jch-muted uppercase">
              {visionMission.pointsLabel}
            </p>
            <ul className="flex flex-col gap-3">
              {visionMission.points.map((point) => (
                <li key={point} className="flex items-start gap-3 leading-[1.45] text-jch-muted">
                  <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-jch-orange" strokeWidth={2.5} />
                  {point}
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </section>

      {/* Our service commitment */}
      <section className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-12`}>
          <SectionHeading tone="light" eyebrow={commitment.eyebrow} title={commitment.title} />
          <Reveal className="grid grid-cols-2 gap-10 text-lg leading-[1.65] text-jch-dim max-[960px]:grid-cols-1 max-[960px]:gap-6">
            {commitment.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Quality & reliability */}
      <section className={`bg-jch-bg text-jch-ink ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-12`}>
          <SectionHeading
            eyebrow={quality.eyebrow}
            title={quality.title}
            lead={quality.lead}
          />
          <Reveal as="ul" stagger={0.06} className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[520px]:grid-cols-1">
            {quality.items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl border border-jch-line bg-jch-panel px-6 py-5 font-tight text-lg leading-[1.2] font-semibold uppercase"
              >
                <Check aria-hidden className="size-5 shrink-0 text-jch-orange" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <WhyChoose />

      {/* Who we work with */}
      <section className={`bg-white text-jch-bg ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-12`}>
          <SectionHeading
            tone="light"
            eyebrow={clients.eyebrow}
            title={clients.title}
          />
          <Reveal as="ul" stagger={0.04} y={14} className="flex flex-wrap gap-3">
            {clients.items.map((client) => (
              <li
                key={client}
                className="rounded-full border border-jch-bg/25 px-5 py-2.5 font-tight font-semibold uppercase max-[640px]:text-sm"
              >
                {client}
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Company credentials */}
      <section id="credentials" className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} grid grid-cols-[1fr_1.4fr] gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-10`}>
          <div className="flex flex-col items-start gap-8">
            <SectionHeading
              tone="light"
              eyebrow={credentials.eyebrow}
              title={credentials.title}
              lead={credentials.lead}
            />
            {companyProfilePdf ? (
              <a href={safeHref(companyProfilePdf)} download className={btn.dark}>
                <Download aria-hidden className="size-4" strokeWidth={2.5} />
                {credentials.downloadLabel}
              </a>
            ) : (
              <a href={safeHref(credentials.requestHref)} className={btn.dark}>
                {credentials.requestLabel}
              </a>
            )}
          </div>
          <table className="w-full border-collapse self-start text-left">
            <caption className="sr-only">{settings.business.name} company credentials</caption>
            <Reveal as="tbody" stagger={0.05} y={12}>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-jch-bg/15 first:border-t">
                  <th scope="row" className="w-1/2 py-5 pr-6 align-top font-tight font-semibold uppercase max-[640px]:text-sm">
                    {row.label}
                  </th>
                  <td className={`py-5 align-top text-lg max-[640px]:text-base ${row.value ? "font-semibold" : "text-jch-dim"}`}>
                    {row.value || settings.labels.credentialFallback}
                  </td>
                </tr>
              ))}
            </Reveal>
          </table>
        </div>
      </section>

      <CtaBanner {...cta} />
    </>
  );
}
