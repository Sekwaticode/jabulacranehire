import { createClient } from "@supabase/supabase-js";
import { isCmsConfigured, supabaseConfig } from "../content/load";

// The dashboard signs in with Supabase Auth. Only the public anon key is in
// the browser; every permission check runs in the database (RLS).
export const supabase = isCmsConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "jch-admin-auth" },
    })
  : null;

export const MEDIA_BUCKET = "site-media";

/** Supabase error → a sentence the owner can act on. */
export function friendlyError(error: unknown): string {
  const message =
    typeof error === "object" && error && "message" in error ? String((error as { message: unknown }).message) : String(error);
  if (/JWT expired|invalid JWT|not authenticated/i.test(message)) return "Your session has expired. Sign in again.";
  if (/permission denied|42501|row-level security/i.test(message)) return "You don't have permission to do that.";
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) return "Couldn't reach the server. Check your connection and try again.";
  if (/duplicate key/i.test(message)) return "Something with that name already exists.";
  return message;
}
