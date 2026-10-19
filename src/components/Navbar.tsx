import type { RefObject } from "react";
import { useContent } from "../content/ContentContext";
import { safeImageSrc } from "../content/links";

type NavbarProps = {
  isMenuOpen: boolean;
  onToggle: () => void;
  logoRef: RefObject<HTMLDivElement | null>;
  togglerRef: RefObject<HTMLButtonElement | null>;
};

const barClass = "h-0.5 w-10 bg-white transition-all duration-400 ease-[ease]";

export default function Navbar({
  isMenuOpen,
  onToggle,
  logoRef,
  togglerRef,
}: NavbarProps) {
  const { logo } = useContent().settings.brand;
  return (
    <nav className="fixed top-0 left-0 z-10 flex w-full items-center justify-between p-6 mix-blend-difference">
      <div ref={logoRef} className="w-32 cursor-pointer p-4 will-change-transform">
        <a href="/">
          <img
            src={safeImageSrc(logo.src) || "/logo.png"}
            alt={logo.alt}
            className="h-full w-full object-cover"
          />
        </a>
      </div>
      <button
        ref={togglerRef}
        type="button"
        onClick={onToggle}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
        className="flex cursor-pointer flex-col items-center justify-center gap-[5px] border-none bg-transparent p-4 will-change-transform"
      >
        <span
          className={`${barClass} ${isMenuOpen ? "translate-y-[3.5px] rotate-45 scale-x-75" : ""}`}
        ></span>
        <span
          className={`${barClass} ${isMenuOpen ? "-translate-y-[3.5px] -rotate-45 scale-x-75" : ""}`}
        ></span>
      </button>
    </nav>
  );
}
