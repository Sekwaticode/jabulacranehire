import { Check, Download } from "lucide-react";
import PageHeader from "../components/PageHeader";
import CtaBanner from "../components/sections/CtaBanner";
import WhyChoose from "../components/sections/WhyChoose";
import {
  btn,
  container,
  SectionHeading,
  sectionPad,
} from "../components/ui/primitives";
import { about, ON_REQUEST, site } from "../data/site";

const cardClass =
  "flex flex-col gap-5 rounded-2xl border border-jch-line bg-jch-panel p-10 max-[640px]:p-6";
const cardTitle =
  "font-tight text-[13px] font-semibold tracking-[0.22em] text-jch-orange uppercase";

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="About Jabula Crane Hire"
        lead="A South African lifting and material-handling equipment hire company, based in Witbank."
        image={site.images.about}
      />

      {/* Who we are */}
      <section className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} grid grid-cols-[1fr_1.4fr] gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-8`}>
          <SectionHeading tone="light" eyebrow="Who we are" title="Reliable machines, professional people" />
          <div className="flex flex-col gap-6 text-xl leading-[1.6] max-[640px]:text-lg">
            {about.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Vision and mission */}
      <section className={`bg-jch-bg text-jch-ink ${sectionPad}`}>
        <div className={`${container} grid grid-cols-2 gap-6 max-[960px]:grid-cols-1`}>
          <article className={cardClass}>
            <h2 className={cardTitle}>Our vision</h2>
            <p className="font-tight text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.25] font-medium tracking-[-0.01em]">
              {about.vision}
            </p>
          </article>
          <article className={cardClass}>
            <h2 className={cardTitle}>Our mission</h2>
            <p className="text-lg leading-[1.6]">{about.mission}</p>
            <p className="font-tight text-[13px] font-semibold tracking-[0.12em] text-jch-muted uppercase">
              We strive to
            </p>
            <ul className="flex flex-col gap-3">
              {about.missionPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 leading-[1.45] text-jch-muted">
                  <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-jch-orange" strokeWidth={2.5} />
                  {point}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* Our service commitment */}
      <section className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-12`}>
          <SectionHeading tone="light" eyebrow="Our service commitment" title={site.slogan} />
          <div className="grid grid-cols-2 gap-10 text-lg leading-[1.65] text-jch-dim max-[960px]:grid-cols-1 max-[960px]:gap-6">
            {about.commitment.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & reliability */}
      <section className={`bg-jch-bg text-jch-ink ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-12`}>
          <SectionHeading
            eyebrow="Quality & reliability"
            title="Equipment that is there when you need it"
            lead="We maintain a reliable fleet and stay responsive for the whole hire period, to cut unnecessary downtime and keep your project moving."
          />
          <ul className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[520px]:grid-cols-1">
            {about.quality.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl border border-jch-line bg-jch-panel px-6 py-5 font-tight text-lg leading-[1.2] font-semibold uppercase"
              >
                <Check aria-hidden className="size-5 shrink-0 text-jch-orange" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <WhyChoose />

      {/* Who we work with */}
      <section className={`bg-white text-jch-bg ${sectionPad}`}>
        <div className={`${container} flex flex-col gap-12`}>
          <SectionHeading
            tone="light"
            eyebrow="Who we work with"
            title="Clients and project partners"
          />
          <ul className="flex flex-wrap gap-3">
            {about.clients.map((client) => (
              <li
                key={client}
                className="rounded-full border border-jch-bg/25 px-5 py-2.5 font-tight font-semibold uppercase max-[640px]:text-sm"
              >
                {client}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Company credentials */}
      <section id="credentials" className={`bg-jch-ink text-jch-bg ${sectionPad}`}>
        <div className={`${container} grid grid-cols-[1fr_1.4fr] gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-10`}>
          <div className="flex flex-col items-start gap-8">
            <SectionHeading
              tone="light"
              eyebrow="Company credentials"
              title="For your supplier file"
              lead="What procurement teams usually ask for when approving a new supplier."
            />
            {site.companyProfilePdf ? (
              <a href={site.companyProfilePdf} download className={btn.dark}>
                <Download aria-hidden className="size-4" strokeWidth={2.5} />
                Download company profile (PDF)
              </a>
            ) : (
              <a href="/contact#quote" className={btn.dark}>
                Request our company profile
              </a>
            )}
          </div>
          <table className="w-full border-collapse self-start text-left">
            <caption className="sr-only">Jabula Crane Hire company credentials</caption>
            <tbody>
              {site.credentials.map((row) => (
                <tr key={row.label} className="border-b border-jch-bg/15 first:border-t">
                  <th scope="row" className="w-1/2 py-5 pr-6 align-top font-tight font-semibold uppercase max-[640px]:text-sm">
                    {row.label}
                  </th>
                  <td className={`py-5 align-top text-lg max-[640px]:text-base ${row.value ? "font-semibold" : "text-jch-dim"}`}>
                    {row.value || ON_REQUEST}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
