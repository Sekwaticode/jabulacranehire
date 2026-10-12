import { useContext, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { careers } from "../../data/site";
import { PageScrollContext } from "../../lib/pageScroll";
import { container, focusRing, Photo } from "../ui/primitives";

const TITLE = "The teams behind every safe lift";

const arrowButton = `inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-jch-muted/50 transition-colors duration-300 ease-jch hover:border-jch-orange hover:bg-jch-orange hover:text-jch-bg motion-reduce:transition-none ${focusRing}`;

export default function Teams() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { scroller } = useContext(PageScrollContext);
  const [index, setIndex] = useState(0);
  const { teams } = careers;
  const team = teams[index];

  // The two title lines drift in opposite directions as the section scrolls by.
  const { scrollYProgress } = useScroll({
    target: titleRef,
    container: scroller,
    offset: ["start end", "end start"],
  });
  const xTop = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const xBottom = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  const step = (by: number) =>
    setIndex((current) => (current + by + teams.length) % teams.length);

  return (
    <section id="teams" className="bg-jch-bg py-28 text-jch-ink max-[960px]:py-20 max-[640px]:py-16">
      <h2
        ref={titleRef}
        aria-label={TITLE}
        className="flex flex-col overflow-hidden font-tight text-2xl leading-[1.05] font-semibold tracking-tighter uppercase md:text-4xl lg:text-6xl"
      >
        <motion.span aria-hidden className="whitespace-nowrap" style={{ x: xTop }}>
          {TITLE}
        </motion.span>
        <motion.span
          aria-hidden
          className="self-end whitespace-nowrap text-jch-muted/50"
          style={{ x: xBottom }}
        >
          {TITLE}
        </motion.span>
      </h2>

      <div className={container}>
        <div aria-live="polite" className="mt-20 max-[640px]:mt-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={team.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-[0.8fr_1.2fr] items-stretch gap-14 max-[960px]:grid-cols-1 max-[960px]:gap-8"
            >
              <Photo
                src={team.image}
                alt={`The ${team.name} team at Jabula Crane Hire`}
                caption={team.name}
                className="min-h-[380px] w-full max-[960px]:min-h-[260px]"
              />
              <div className="flex flex-col justify-center gap-6">
                <p className="font-poppins text-sm font-semibold text-jch-orange">
                  {String(index + 1).padStart(2, "0")} / {String(teams.length).padStart(2, "0")}
                </p>
                <p className="font-tight text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[1.2] font-medium tracking-[-0.015em] text-balance">
                  {team.text}
                </p>
                <div>
                  <h3 className="font-tight text-xl font-semibold uppercase">{team.name}</h3>
                  <p className="text-jch-muted">{team.role}</p>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex gap-4 lg:mt-10">
          <button type="button" aria-label="Previous team" onClick={() => step(-1)} className={arrowButton}>
            <ArrowLeft aria-hidden className="size-6" strokeWidth={1.5} />
          </button>
          <button type="button" aria-label="Next team" onClick={() => step(1)} className={arrowButton}>
            <ArrowRight aria-hidden className="size-6" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
