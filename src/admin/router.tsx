// A tiny router for /admin paths, separate from the public site's.

import { type AnchorHTMLAttributes, useEffect, useState } from "react";

const listeners = new Set<() => void>();

/** Blocks leaving a screen with unsaved edits. Returns false to stay. */
let leaveGuard: (() => boolean) | null = null;
export function setLeaveGuard(guard: (() => boolean) | null) {
  leaveGuard = guard;
}

export function navigate(to: string) {
  if (leaveGuard && !leaveGuard()) return;
  window.history.pushState(null, "", to);
  listeners.forEach((l) => l());
  const hash = to.split("#")[1];
  requestAnimationFrame(() => {
    if (hash) document.getElementById(hash)?.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  });
}

export function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    listeners.add(update);
    window.addEventListener("popstate", update);
    return () => {
      listeners.delete(update);
      window.removeEventListener("popstate", update);
    };
  }, []);
  return path.replace(/\/+$/, "") || "/admin";
}

export function Link({ href, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        navigate(href);
      }}
      {...props}
    />
  );
}
