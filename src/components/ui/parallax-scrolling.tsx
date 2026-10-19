import { type ReactNode, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* Scroll-linked parallax for a stack of layers. Mark the layers inside
   `children` with data attributes; each one moves as the root scrolls from
   the top of the viewport until its bottom edge leaves it:

     data-parallax-layer           opts the element in
     data-parallax-y="12"          yPercent (of the layer's own height) reached
                                   by the end; positive lags the scroll and
                                   reads as further away, negative leads it
     data-parallax-opacity="0.2"   optional opacity reached by the end
     data-parallax-mobile="off"    skip on small screens to save the GPU

   Smooth scrolling is App's Lenis instance on #page, so this component only
   tells ScrollTrigger which element scrolls; it never starts a scroller of
   its own. Without JavaScript, or with reduced motion, the layers simply sit
   where their CSS puts them. */

const SMALL_SCREEN = "(max-width: 767px)";

type ParallaxScrollingProps = {
  children: ReactNode;
  className?: string;
  /** The scrolling element, or a selector for it. Defaults to the window.
      A selector is looked up on mount: an ancestor's ref is not attached yet
      when a child's layout effect first runs. */
  scroller?: string | Element;
  /** ScrollTrigger scrub: true follows the scroll exactly, a number eases behind it. */
  scrub?: boolean | number;
  "aria-labelledby"?: string;
};

export default function ParallaxScrolling({
  children,
  className = "",
  scroller,
  scrub = 0.4,
  ...rest
}: ParallaxScrollingProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Scoped to this root, so revert() only touches the triggers made here.
    const mm = gsap.matchMedia(root);
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        small: SMALL_SCREEN,
      },
      (context) => {
        const { motion, small } = context.conditions as { motion: boolean; small: boolean };
        if (!motion) return;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            scroller: typeof scroller === "string" ? document.querySelector(scroller) ?? undefined : scroller,
            start: "top top",
            end: "bottom top",
            scrub,
          },
        });

        root.querySelectorAll<HTMLElement>("[data-parallax-layer]").forEach((layer) => {
          if (small && layer.dataset.parallaxMobile === "off") return;
          const vars: gsap.TweenVars = { yPercent: Number(layer.dataset.parallaxY ?? 0) };
          if (layer.dataset.parallaxOpacity !== undefined) {
            vars.opacity = Number(layer.dataset.parallaxOpacity);
          }
          tl.to(layer, vars, 0);
        });
      },
    );

    return () => mm.revert();
  }, [scroller, scrub]);

  return (
    <section ref={rootRef} data-parallax-layers className={className} {...rest}>
      {children}
    </section>
  );
}
