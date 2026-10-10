import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import Navbar from "./components/Navbar";
import Menu from "./components/Menu";
import Footer from "./components/Footer";
import ActionBar from "./components/ActionBar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { initAnalytics, track } from "./lib/analytics";

const routes = {
  "/": {
    Page: Home,
    title: "Crane Hire, Forklifts & Telehandlers in Mpumalanga | Jabula Crane Hire",
  },
  "/about": { Page: About, title: "About Us | Jabula Crane Hire" },
  "/contact": {
    Page: Contact,
    title: "Request a Quote or Call Us | Jabula Crane Hire",
  },
};

type RoutePath = keyof typeof routes;

// Unknown paths fall back to Home.
function toRoute(pathname: string): RoutePath {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path in routes ? (path as RoutePath) : "/";
}

// Position of `el` inside the scroll container. Built from offsets rather than
// getBoundingClientRect because #page is scaled while the menu is open.
function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

export default function App() {
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navLogoRef = useRef<HTMLDivElement>(null);
  const navTogglerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);
  const isMenuOpenRef = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [route, setRoute] = useState(() => toRoute(window.location.pathname));
  const routeRef = useRef(route);

  // Smooth scrolling, menu word splitting, and hide-nav-on-scroll.
  useLayoutEffect(() => {
    const page = pageRef.current!;
    const lenis = new Lenis({ wrapper: page, content: page, autoRaf: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const split = SplitText.create(menuRef.current!.querySelectorAll("a"), {
      type: "words",
      wordsClass: "word",
      mask: "words",
    });

    let isNavHidden = false;

    lenis.on("scroll", ({ direction }) => {
      const hide = direction === 1;
      if (hide === isNavHidden) return;
      isNavHidden = hide;

      gsap.to(navLogoRef.current, {
        x: hide ? -300 : 0,
        duration: 5,
        ease: "power3.out",
        overwrite: true,
      });
      gsap.to(navTogglerRef.current, {
        x: hide ? 300 : 0,
        duration: 5,
        ease: "power3.out",
        overwrite: true,
      });
    });

    // #page is both Lenis wrapper and content, so Lenis can't see the content
    // height change (page switch, FAQ opening, fonts loading). Watch it here.
    let refreshTimer = 0;
    const observer = new ResizeObserver(() => {
      lenis.resize();
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    observer.observe(contentRef.current!);

    return () => {
      observer.disconnect();
      window.clearTimeout(refreshTimer);
      menuTlRef.current?.kill();
      split.revert();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const setMenu = (open: boolean) => {
    if (open === isMenuOpenRef.current) return;
    isMenuOpenRef.current = open;
    setIsMenuOpen(open);
    open ? lenisRef.current?.stop() : lenisRef.current?.start();

    const isMobile = window.matchMedia("(max-width: 999px)").matches;

    menuTlRef.current?.kill();
    const tl = gsap.timeline();
    menuTlRef.current = tl;

    tl.to(pageRef.current, {
      y: open ? (isMobile ? "65svh" : "50svh") : 0,
      scale: open ? (isMobile ? 0.85 : 0.95) : 1,
      borderRadius: open ? "20px" : "0px",
      duration: 1,
      ease: "power3.inOut",
    });

    menuRef.current!.querySelectorAll("[data-menu-col]").forEach((col) => {
      col.querySelectorAll("a").forEach((link, i) => {
        tl.to(
          link.querySelectorAll(".word"),
          {
            y: open ? "0%" : "100%",
            duration: open ? 1 : 0.75,
            ease: "power3.out",
          },
          open ? 0.65 + i * 0.1 : 0.1,
        );
      });
    });
  };

  const toggleMenu = () => setMenu(!isMenuOpenRef.current);

  // Scrolls to the element a hash names, or to the top when there is none.
  const scrollToHash = (hash: string, immediate: boolean) => {
    const lenis = lenisRef.current;
    const page = pageRef.current;
    if (!lenis || !page) return;

    let top = 0;
    if (hash.length > 1) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      top = offsetWithin(target, page);
    }
    lenis.resize();
    lenis.scrollTo(top, { immediate, force: true });
  };

  // Client-side routing: the navbar, menu and footer use plain <a> links, so
  // internal clicks are picked up here instead of reloading the page.
  useEffect(() => {
    initAnalytics();

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element).closest?.<HTMLAnchorElement>("a[href]");
      if (!link) return;

      if (link.protocol === "tel:") track("click_to_call", { number: link.pathname });
      if (link.hostname === "wa.me") track("click_whatsapp");

      const isInternal =
        link.origin === window.location.origin &&
        link.target !== "_blank" &&
        !link.hasAttribute("download") &&
        // Files in /public, e.g. the company profile PDF.
        !/\.[a-z0-9]+$/i.test(link.pathname);
      if (!isInternal) return;

      event.preventDefault();
      setMenu(false);

      const next = toRoute(link.pathname);
      const url = next + link.hash;
      if (next !== routeRef.current) {
        window.history.pushState(null, "", url);
        routeRef.current = next;
        setRoute(next);
        return;
      }
      if (url !== window.location.pathname + window.location.hash) {
        window.history.pushState(null, "", url);
      }
      scrollToHash(link.hash, false);
    };

    const onPopState = () => {
      const next = toRoute(window.location.pathname);
      if (next === routeRef.current) {
        scrollToHash(window.location.hash, false);
        return;
      }
      routeRef.current = next;
      setRoute(next);
    };

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
    };
    // setMenu and scrollToHash only read refs, so the first render's copies stay valid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On every page change: set the title, reset the scroll, then honour a hash.
  useEffect(() => {
    document.title = routes[route].title;
    track("page_view", { page_path: route, page_title: routes[route].title });

    lenisRef.current?.resize();
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.refresh();

    const hash = window.location.hash;
    if (!hash) return;
    let cancelled = false;
    const jump = () => !cancelled && scrollToHash(hash, true);
    const frame = requestAnimationFrame(jump);
    // Web fonts reflow the text above the target, so land on it again.
    document.fonts.ready.then(jump);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  const { Page } = routes[route];

  return (
    <>
      <Navbar
        isMenuOpen={isMenuOpen}
        onToggle={toggleMenu}
        logoRef={navLogoRef}
        togglerRef={navTogglerRef}
      />
      <Menu ref={menuRef} />

      <div
        id="page"
        ref={pageRef}
        className="fixed top-0 left-0 z-[2] h-svh w-full overflow-x-hidden overflow-y-auto bg-jch-bg will-change-[transform,border-radius]"
      >
        <div ref={contentRef}>
          <main key={route}>
            <Page />
          </main>
          <Footer />
          {/* Clears the sticky action bar on phones */}
          <div aria-hidden className="h-[calc(60px+env(safe-area-inset-bottom))] bg-jch-bg md:hidden"></div>
        </div>
      </div>

      <ActionBar hidden={isMenuOpen} />
    </>
  );
}
