// Opens the real site in a new tab showing the saved drafts. The draft is
// handed over with postMessage, so it never travels through a public URL and
// the public site never fetches drafts itself.

import type { SiteContent } from "../content/types";

export function openPreview(path: string, content: SiteContent) {
  const target = new URL(path, window.location.origin);
  target.searchParams.set("cms-preview", "1");
  const win = window.open(target.toString(), "_blank");
  if (!win) return false;

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin || event.source !== win) return;
    if (event.data?.type !== "jch-preview-ready") return;
    win.postMessage({ type: "jch-preview-content", content }, window.location.origin);
  };
  window.addEventListener("message", onMessage);
  // Stop listening once the tab has had time to load.
  setTimeout(() => window.removeEventListener("message", onMessage), 60000);
  return true;
}
