// Loads every editable record once and keeps it in memory for the dashboard.
// Writes go straight to Supabase; the store then reloads what changed.

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultContent } from "../content/defaults";
import { blank, mergeShape } from "../content/merge";
import { equipmentFields, pageSchema, seoFields, settingsSchema, type Field } from "../content/schema";
import type { PageSlug, SiteContent } from "../content/types";
import { friendlyError, supabase } from "./supabase";

export type Table = "pages" | "page_sections" | "site_settings" | "equipment";

type RowBase = {
  id: string;
  draft: Record<string, unknown>;
  published: Record<string, unknown> | null;
  draft_updated_at: string;
  published_at: string | null;
  updated_by: string | null;
};

export type PageRow = RowBase & { slug: PageSlug; title: string; path: string; sort_order: number };
export type SectionRow = RowBase & { page_id: string; section_key: string; section_type: string; label: string; sort_order: number };
export type SettingRow = RowBase & { setting_key: string; label: string };
export type EquipmentRow = RowBase & {
  slug: string;
  sort_order: number;
  draft_sort_order: number;
  is_published: boolean;
  created_at: string;
};
export type MediaRow = {
  id: string;
  file_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  created_at: string;
};
export type Profile = { id: string; email: string; full_name: string; role: "owner" | "editor" | "none" };

/** One editable thing as the dashboard sees it. */
export type Item = {
  table: Table;
  id: string;
  /** Where it is edited, e.g. "/admin/pages/home#hero". */
  href: string;
  label: string;
  group: string;
  fields: Field[];
  template: unknown;
  row: RowBase;
  status: Status;
};

export type Status = "live" | "changed" | "new" | "unpublished";

export const statusLabel: Record<Status, string> = {
  live: "Live",
  changed: "Unpublished changes",
  new: "Not published yet",
  unpublished: "Hidden from site",
};

/** JSON equality that ignores key order (Postgres reorders jsonb keys). */
export function sameJson(a: unknown, b: unknown): boolean {
  return canonical(a) === canonical(b);
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function statusOf(row: RowBase, equipment?: EquipmentRow): Status {
  if (!row.published) return "new";
  if (equipment && !equipment.is_published) return "unpublished";
  if (!sameJson(row.draft, row.published)) return "changed";
  if (equipment && equipment.draft_sort_order !== equipment.sort_order) return "changed";
  return "live";
}

type Data = {
  pages: PageRow[];
  sections: SectionRow[];
  settings: SettingRow[];
  equipment: EquipmentRow[];
  media: MediaRow[];
  profile: Profile;
};

type Store = Data & {
  items: Item[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  /** Draft content in the public site's shape, for previews. */
  draftContent: () => SiteContent;
};

const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore outside CmsDataProvider");
  return store;
}

async function fetchAll(): Promise<Omit<Data, "profile">> {
  const db = supabase!;
  const [pages, sections, settings, equipment, media] = await Promise.all([
    db.from("pages").select("*").order("sort_order"),
    db.from("page_sections").select("*").order("sort_order"),
    db.from("site_settings").select("*"),
    db.from("equipment").select("*").order("draft_sort_order").order("created_at"),
    db.from("media").select("*").order("created_at", { ascending: false }),
  ]);
  for (const result of [pages, sections, settings, equipment, media]) if (result.error) throw result.error;
  return {
    pages: pages.data as PageRow[],
    sections: sections.data as SectionRow[],
    settings: settings.data as SettingRow[],
    equipment: equipment.data as EquipmentRow[],
    media: media.data as MediaRow[],
  };
}

// New and existing equipment items start from an empty shape, never from
// another machine's text.
const { id: _unusedId, ...equipmentTemplate } = blank(defaultContent.equipment[0]);

export function buildItems(data: Omit<Data, "profile" | "media">): Item[] {
  const items: Item[] = [];
  for (const page of data.pages) {
    const schema = pageSchema[page.slug];
    if (!schema) continue;
    items.push({
      table: "pages",
      id: page.id,
      href: `/admin/pages/${page.slug}#seo`,
      label: `${schema.label}: search & browser title`,
      group: schema.label,
      fields: seoFields,
      template: defaultContent.pages[page.slug].seo,
      row: page,
      status: statusOf(page),
    });
    for (const def of schema.sections) {
      const row = data.sections.find((s) => s.page_id === page.id && s.section_key === def.key);
      if (!row) continue;
      items.push({
        table: "page_sections",
        id: row.id,
        href: `/admin/pages/${page.slug}#${def.key}`,
        label: `${schema.label}: ${def.label}`,
        group: schema.label,
        fields: def.fields,
        template: (defaultContent.pages[page.slug].sections as Record<string, unknown>)[def.key],
        row,
        status: statusOf(row),
      });
    }
  }
  for (const def of settingsSchema) {
    const row = data.settings.find((s) => s.setting_key === def.key);
    if (!row) continue;
    items.push({
      table: "site_settings",
      id: row.id,
      href: `/admin/settings#${def.key}`,
      label: `Settings: ${def.label}`,
      group: "Settings",
      fields: def.fields,
      template: (defaultContent.settings as Record<string, unknown>)[def.key],
      row,
      status: statusOf(row),
    });
  }
  for (const row of data.equipment) {
    items.push({
      table: "equipment",
      id: row.id,
      href: `/admin/equipment/${row.id}`,
      label: `Equipment: ${String(row.draft.title || row.slug)}`,
      group: "Equipment",
      fields: equipmentFields,
      template: equipmentTemplate,
      row,
      status: statusOf(row, row),
    });
  }
  return items;
}

/** Saved drafts laid over the defaults, in the shape the public site renders. */
export function toDraftContent(data: Omit<Data, "profile" | "media">): SiteContent {
  const settings: Record<string, unknown> = {};
  for (const row of data.settings) settings[row.setting_key] = row.draft;
  const pages: Record<string, unknown> = {};
  for (const page of data.pages) {
    const sections: Record<string, unknown> = {};
    for (const row of data.sections) if (row.page_id === page.id) sections[row.section_key] = row.draft;
    pages[page.slug] = { seo: page.draft, sections };
  }
  // Preview shows what the next publish would: hidden items stay hidden.
  const equipment = data.equipment
    .filter((row) => row.is_published || !row.published)
    .sort((a, b) => a.draft_sort_order - b.draft_sort_order)
    .map((row) => ({ ...row.draft, id: row.slug }));
  return mergeShape(defaultContent, { settings, pages, equipment });
}

export function CmsDataProvider({ profile, children }: { profile: Profile; children: ReactNode }) {
  const [data, setData] = useState<Omit<Data, "profile"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchAll());
      setError(null);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const store = useMemo<Store | null>(() => {
    if (!data) return null;
    return {
      ...data,
      profile,
      items: buildItems(data),
      loading,
      error,
      reload,
      draftContent: () => toDraftContent(data),
    };
  }, [data, profile, loading, error, reload]);

  if (!store) {
    return (
      <div className="flex min-h-svh items-center justify-center p-8 text-center text-jch-dim">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <p role="alert">Couldn't load the website content: {error}</p>
            <button type="button" className="rounded-lg bg-jch-bg px-4 py-2 font-semibold text-white" onClick={() => void reload()}>
              Try again
            </button>
          </div>
        ) : (
          <p>Loading content…</p>
        )}
      </div>
    );
  }
  return <StoreContext value={store}>{children}</StoreContext>;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function saveDraft(table: Table, id: string, draft: unknown) {
  const { error } = await supabase!.from(table).update({ draft }).eq("id", id);
  if (error) throw error;
}

export async function publish(table: Table, id: string) {
  const { error } = await supabase!.rpc("cms_publish", { p_table: table, p_id: id });
  if (error) throw error;
}

export async function publishAll(): Promise<number> {
  const { data, error } = await supabase!.rpc("cms_publish_all");
  if (error) throw error;
  return data as number;
}

export async function revertToLive(table: Table, id: string) {
  const { error } = await supabase!.rpc("cms_discard_draft", { p_table: table, p_id: id });
  if (error) throw error;
}

export type Revision = { id: string; content: Record<string, unknown>; published_at: string; published_by: string | null };

export async function loadRevisions(table: Table, id: string): Promise<Revision[]> {
  const { data, error } = await supabase!
    .from("content_revisions")
    .select("id, content, published_at, published_by")
    .eq("entity_table", table)
    .eq("entity_id", id)
    .order("published_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as Revision[];
}

export async function restoreRevision(revisionId: string) {
  const { error } = await supabase!.rpc("cms_restore_revision", { p_revision: revisionId });
  if (error) throw error;
}
