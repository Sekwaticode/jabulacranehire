import { createContext, type RefObject } from "react";

// The page scrolls inside #page under Lenis, which App owns. Components that
// need to pause that scroll (a full-screen dialog), track it (scroll-linked
// motion), jump to a section or change page go through this context rather
// than reaching for the Lenis instance or the router.
export type PageScroll = {
  /** The scrolling element, for scroll-linked animation. */
  scroller: RefObject<HTMLDivElement | null>;
  setLocked: (locked: boolean) => void;
  scrollToHash: (hash: string) => void;
  /** Go to an internal URL such as "/contact?equipment=Forklift#quote". */
  navigate: (to: string) => void;
};

export const PageScrollContext = createContext<PageScroll>({
  scroller: { current: null },
  setLocked: () => {},
  scrollToHash: () => {},
  navigate: () => {},
});
