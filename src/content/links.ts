// Link rules shared by the public site and the dashboard. The database
// enforces the same rules (see supabase/migrations), so a bad link is refused
// on save and, failing that, never rendered.

import type { BusinessSettings } from "./types";

const SITE_PATH = /^\/(?!\/)[A-Za-z0-9\-._~/?#=&%+]*$/;
const ANCHOR = /^#[A-Za-z0-9\-_]+$/;
const EMAIL = /^mailto:[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;
const TEL = /^tel:\+?[0-9]{6,15}$/;

/** Why a link is not allowed, or null when it is fine. */
export function linkError(href: string): string | null {
  const value = href.trim();
  if (!value) return "Add a link destination.";
  if (value !== href) return "Remove the spaces around the link.";
  if (SITE_PATH.test(value) || ANCHOR.test(value) || EMAIL.test(value) || TEL.test(value)) return null;
  if (value.startsWith("https://")) {
    try {
      const url = new URL(value);
      if (url.protocol === "https:" && url.hostname.includes(".")) return null;
    } catch {
      /* falls through */
    }
    return "That web address doesn't look right.";
  }
  if (value.startsWith("http://")) return "Use a secure address starting with https://.";
  return "Use a page on this site (like /contact), an https:// address, mailto: or tel:.";
}

/** The href to render: the link itself when it passes, otherwise a harmless "#". */
export function safeHref(href: string): string {
  return linkError(href) === null ? href : "#";
}

/** Image sources: files shipped with the site ("/logo.png") or https URLs. */
export function imageSrcError(src: string): string | null {
  if (!src) return null;
  if (SITE_PATH.test(src) && !src.includes("?")) return null;
  if (src.startsWith("https://")) return linkError(src);
  return "Images must come from the media library.";
}

export function safeImageSrc(src: string): string {
  return imageSrcError(src) === null ? src : "";
}

/** "013 241 1017" → "tel:+27132411017". South African numbers starting with 0
    get the +27 country code; numbers already starting with + keep theirs. */
export function telHref(display: string): string {
  const trimmed = display.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "#";
  if (trimmed.startsWith("+")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+27${digits.slice(1)}`;
  if (digits.startsWith("27")) return `tel:+${digits}`;
  return `tel:${digits}`;
}

export function whatsappUrl(business: BusinessSettings, message: string = business.whatsappMessage) {
  const number = business.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Plain WhatsApp profile link, as the footer used. */
export function whatsappProfileUrl(business: BusinessSettings) {
  return `https://wa.me/${business.whatsappNumber.replace(/\D/g, "")}`;
}

/** True for links that should open in a new tab. */
export function isExternal(href: string) {
  return href.startsWith("https://");
}
