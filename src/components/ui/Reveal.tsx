import {
  type ComponentPropsWithoutRef,
  type ElementType,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

/* Scroll-in motion shared across the site. Everything here is GSAP on App's
   #page scroller, runs once per element, and is skipped entirely when the
   visitor prefers reduced motion (or JavaScript is off): the content simply
   sits where its CSS puts it. */

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
const EASE = "power3.out";

// Looked up on mount: App's ref on #page isn't attached yet when a child's
// layout effect first runs, but the element is already in the document.
export const pageScroller = () => document.getElementById("page") ?? undefined;

const onEnter = (trigger: Element) => ({
  trigger,
  scroller: pageScroller(),
  start: "top 86%",
  once: true,
});

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Seconds between each child starting. */
  stagger?: number;
  /** How far, in px, each child rises as it fades in. */
  y?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Fades its direct children up, one after another, as it scrolls into view. */
export default function Reveal<T extends ElementType = "div">({
  as,
  stagger = 0.08,
  y = 28,
  ...rest
}: RevealProps<T>) {
  const Tag: ElementType = as ?? "div";
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add(MOTION_OK, () => {
      gsap.from(root.children, {
        autoAlpha: 0,
        y,
        duration: 0.9,
        ease: EASE,
        stagger,
        clearProps: "transform,opacity,visibility",
        scrollTrigger: onEnter(root),
      });
    });
    return () => mm.revert();
  }, [stagger, y]);

  return <Tag ref={ref} {...rest} />;
}

/** Heading motion for a block marked up with:
      [data-reveal-bar]    eyebrow rule, drawn left to right
      [data-reveal-title]  heading, rising line by line from behind a mask
      [data-reveal-fade]   anything else, faded up after the heading
    `onScroll` waits for the block to enter view; otherwise it plays at once
    (page banners, already on screen). `key` re-runs it when the text changes. */
export function useHeadingReveal(
  ref: React.RefObject<HTMLElement | null>,
  { onScroll = true, key = "" }: { onScroll?: boolean; key?: string } = {},
) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);

    mm.add(MOTION_OK, () => {
      const title = root.querySelector<HTMLElement>("[data-reveal-title]");
      const bars = root.querySelectorAll("[data-reveal-bar]");
      const fades = root.querySelectorAll("[data-reveal-fade]");
      const scrollTrigger = onScroll ? onEnter(root) : undefined;

      const tl = gsap.timeline({ scrollTrigger, defaults: { ease: EASE } });
      if (bars.length) {
        tl.from(bars, { scaleX: 0, transformOrigin: "left center", duration: 0.8 }, 0);
      }
      if (fades.length) {
        tl.from(fades, { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.1 }, 0.25);
      }

      if (!title) return;
      // Lines are re-split when the width changes; only the first split animates.
      let played = false;
      let lines: gsap.core.Tween | undefined;
      const split = SplitText.create(title, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          if (played) return;
          if (lines) tl.remove(lines);
          lines = gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.09 });
          tl.add(lines, 0.05);
        },
      });
      tl.eventCallback("onComplete", () => {
        played = true;
      });
      return () => split.revert();
    });

    return () => mm.revert();
  }, [ref, onScroll, key]);
}
