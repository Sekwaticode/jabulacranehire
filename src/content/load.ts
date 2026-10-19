// Fetches the published content before the site first renders.
//
// Visitors get one small request to a read-only database function; there is
// no Supabase client library in the public bundle. If Supabase is not
// configured, slow or down, the last copy this browser saw is used, and
// failing that the built-in defaults, so the site always renders.

import { defaultContent } from "./defaults";
import { mergeShape } from "./merge";
import type { SiteContent } from "./types";

const CACHE_KEY = "jch-published-content-v1";
const PREVIEW_PARAM = "cms-preview";

export const supabaseConfig = {
  url: (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "",
  anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "",
};

export const isCmsConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

function readCache(): unknown {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(data: unknown) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* storage full or blocked: the next visit just fetches again */
  }
}

export async function fetchPublished(signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/rpc/get_published_content`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
      "Content-Type": "application/json",
    },
    body: "{}",
    signal,
  });
  if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
  return response.json();
}

/** Published content, or the best fallback available within `timeoutMs`. */
async function loadPublished(timeoutMs: number): Promise<SiteContent> {
  const cached = readCache();
  if (!isCmsConfigured) return defaultContent;

  const controller = new AbortController();
  const fresh = fetchPublished(controller.signal).then((data) => {
    writeCache(data);
    return data;
  });

  const timer = new Promise<null>((resolve) => setTimeout(() => resolve(null), cached ? timeoutMs / 2 : timeoutMs));
  try {
    const data = await Promise.race([fresh, timer]);
    // Too slow: show the cached copy now; the request still finishes and
    // refreshes the cache for the next visit.
    if (data === null) return mergeShape(defaultContent, cached);
    return mergeShape(defaultContent, data);
  } catch (error) {
    console.warn("Showing saved content:", error);
    return mergeShape(defaultContent, cached);
  }
}

/** Draft content sent by the dashboard to a preview window it opened. */
function waitForPreview(): Promise<SiteContent | null> {
  const opener = window.opener as Window | null;
  if (!opener) return Promise.resolve(null);

  return new Promise((resolve) => {
    const timeout = setTimeout(() => finish(null), 8000);
    function finish(content: SiteContent | null) {
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      resolve(content);
    }
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== opener) return;
      if (event.data?.type !== "jch-preview-content") return;
      finish(mergeShape(defaultContent, event.data.content));
    }
    window.addEventListener("message", onMessage);
    opener.postMessage({ type: "jch-preview-ready" }, window.location.origin);
  });
}

export function isPreviewRequest() {
  return new URLSearchParams(window.location.search).has(PREVIEW_PARAM);
}

export async function loadContent(): Promise<{ content: SiteContent; preview: boolean }> {
  if (isPreviewRequest()) {
    const draft = await waitForPreview();
    if (draft) return { content: draft, preview: true };
  }
  return { content: await loadPublished(1500), preview: false };
}
