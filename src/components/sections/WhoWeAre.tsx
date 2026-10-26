import Reveal from "../ui/Reveal";
import { container, SectionHeading, sectionPad } from "../ui/primitives";
import { useContent } from "../../content/ContentContext";

// "Who we are", shown on About and Home. Its text is edited once, on the
// About page in the dashboard. `tone` picks the light or dark background so
// it can alternate with the sections around it.
export default function WhoWeAre({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { intro } = useContent().pages.about.sections;
  const colours = tone === "light" ? "bg-jch-ink text-jch-bg" : "bg-jch-bg text-jch-ink";

  return (
    <section className={`${colours} ${sectionPad}`}>
      <div className={`${container} grid grid-cols-[1fr_1.4fr] gap-16 max-[960px]:grid-cols-1 max-[960px]:gap-8`}>
        <SectionHeading tone={tone} eyebrow={intro.eyebrow} title={intro.title} />
        <Reveal className="flex flex-col gap-6 text-xl leading-[1.6] max-[640px]:text-lg">
          {intro.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
