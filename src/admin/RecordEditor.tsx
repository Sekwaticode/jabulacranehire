// Edits one record (a page section, a setting, a page's SEO or an equipment
// item): save the draft, publish it, discard edits, or restore a version.

import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, History, RotateCcw, Upload } from "lucide-react";
import { mergeShape } from "../content/merge";
import {
  type Item,
  loadRevisions,
  publish,
  restoreRevision,
  revertToLive,
  type Revision,
  sameJson,
  saveDraft,
  useStore,
} from "./data";
import { FieldIdPrefix, FieldsEditor } from "./fields";
import { setLeaveGuard } from "./router";
import { friendlyError } from "./supabase";
import { Button, Card, formatWhen, Modal, StatusBadge, useConfirm, useToast } from "./ui";
import { blocksSave, validate } from "./validate";

// Editors with unsaved edits, so leaving the screen can warn first.
const dirtyEditors = new Set<string>();
function updateGuard() {
  setLeaveGuard(dirtyEditors.size ? () => window.confirm("You have unsaved edits. Leave without saving them?") : null);
}
window.addEventListener("beforeunload", (event) => {
  if (dirtyEditors.size) event.preventDefault();
});

type Obj = Record<string, unknown>;

export function RecordEditor({
  item,
  anchor,
  title,
  subtitle,
  defaultOpen = false,
  extraActions,
  help,
}: {
  item: Item;
  anchor?: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  extraActions?: ReactNode;
  help?: string;
}) {
  const { reload } = useStore();
  const notify = useToast();
  const confirm = useConfirm();
  const editorId = useId();
  const stored = useMemo(() => mergeShape(item.template, item.row.draft) as Obj, [item.template, item.row.draft]);
  const [value, setValue] = useState<Obj>(stored);
  const [open, setOpen] = useState(defaultOpen || window.location.hash === `#${anchor}`);
  const [busy, setBusy] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // When the stored draft really changes (saved here or elsewhere), start
  // from it. Reloads that return the same content keep unsaved edits.
  const lastStored = useRef(stored);
  useEffect(() => {
    if (sameJson(lastStored.current, stored)) return;
    lastStored.current = stored;
    setValue(stored);
  }, [stored]);

  const dirty = !sameJson(value, stored);
  useEffect(() => {
    if (dirty) dirtyEditors.add(editorId);
    else dirtyEditors.delete(editorId);
    updateGuard();
    return () => {
      dirtyEditors.delete(editorId);
      updateGuard();
    };
  }, [dirty, editorId]);

  const problems = useMemo(() => validate(item.fields, value), [item.fields, value]);
  const [showProblems, setShowProblems] = useState(false);

  const run = async (label: string, action: () => Promise<void>, success: string) => {
    setBusy(label);
    try {
      await action();
      await reload();
      notify("success", success);
    } catch (e) {
      notify("error", friendlyError(e));
    } finally {
      setBusy(null);
    }
  };

  const save = () => {
    setShowProblems(true);
    if (blocksSave(problems)) {
      notify("error", "Fix the highlighted fields before saving.");
      return;
    }
    void run("save", () => saveDraft(item.table, item.id, value), "Draft saved. The live site hasn't changed.");
  };

  const doPublish = () => {
    setShowProblems(true);
    if (problems.length) {
      notify("error", "Fix the highlighted fields before publishing.");
      return;
    }
    void run(
      "publish",
      async () => {
        if (dirty) await saveDraft(item.table, item.id, value);
        await publish(item.table, item.id);
      },
      "Published. Visitors see the change the next time they load the page.",
    );
  };

  const revert = async () => {
    const ok = await confirm({
      title: "Go back to the live version?",
      message: "Your saved draft for this item is replaced with what visitors see now.",
      confirmLabel: "Go back to live",
    });
    if (ok) void run("revert", () => revertToLive(item.table, item.id), "Draft replaced with the live version.");
  };

  const visibleProblems = showProblems ? problems : problems.filter((p) => p.blocks === "save");
  const headingId = `${editorId}-heading`;

  return (
    <Card className="scroll-mt-24 overflow-hidden">
      <section id={anchor} aria-labelledby={headingId} className="scroll-mt-24">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left hover:bg-black/[0.02]"
        >
          <span className="flex flex-col gap-0.5">
            <span id={headingId} className="font-tight text-lg font-semibold text-jch-bg">
              {title}
            </span>
            {subtitle && <span className="text-sm text-jch-dim">{subtitle}</span>}
          </span>
          <span className="flex items-center gap-3">
            {dirty && <span className="text-xs font-semibold text-red-700">Unsaved edits</span>}
            <StatusBadge status={item.status} />
            <ChevronDown aria-hidden className={`size-5 text-jch-dim transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        </button>

        {open && (
          <div className="border-t border-black/10">
            <div className="px-5 py-6">
              {help && <p className="mb-6 rounded-lg bg-black/[0.04] px-4 py-3 text-sm text-jch-dim">{help}</p>}
              <FieldIdPrefix value={`f${editorId.replace(/[^A-Za-z0-9]/g, "")}`}>
                <FieldsEditor fields={item.fields} value={value} onChange={setValue} problems={visibleProblems} template={item.template} />
              </FieldIdPrefix>
            </div>

            {visibleProblems.length > 0 && (
              <div role="alert" className="mx-5 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-semibold">
                  {visibleProblems.some((p) => p.blocks === "save") ? "These need fixing before you can save:" : "These need fixing before you can publish:"}
                </p>
                <ul className="mt-1 list-disc pl-5">
                  {visibleProblems.slice(0, 8).map((p) => (
                    <li key={p.path + p.message}>{p.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-black/10 bg-white/95 px-5 py-3 backdrop-blur">
              <Button variant="dark" disabled={!dirty || !!busy} onClick={save}>
                {busy === "save" ? "Saving…" : "Save draft"}
              </Button>
              <Button variant="primary" disabled={(!dirty && item.status === "live") || !!busy} onClick={doPublish}>
                <Upload aria-hidden className="size-4" />
                {busy === "publish" ? "Publishing…" : dirty ? "Save and publish" : "Publish"}
              </Button>
              <Button variant="ghost" disabled={!dirty || !!busy} onClick={() => setValue(stored)}>
                Discard unsaved edits
              </Button>
              {item.row.published && item.status === "changed" && !dirty && (
                <Button variant="ghost" disabled={!!busy} onClick={() => void revert()}>
                  <RotateCcw aria-hidden className="size-4" />
                  Go back to live version
                </Button>
              )}
              <Button variant="ghost" onClick={() => setShowHistory(true)}>
                <History aria-hidden className="size-4" />
                History
              </Button>
              {extraActions}
              <span className="ml-auto text-xs text-jch-dim">
                Draft saved {formatWhen(item.row.draft_updated_at)} · Published {formatWhen(item.row.published_at)}
              </span>
            </div>
          </div>
        )}
      </section>

      {showHistory && (
        <HistoryDialog
          item={item}
          onClose={() => setShowHistory(false)}
          onRestore={(revision) =>
            void run(
              "restore",
              async () => {
                await restoreRevision(revision.id);
                setShowHistory(false);
              },
              "That version is now your draft. Check it, then publish to make it live.",
            )
          }
        />
      )}
    </Card>
  );
}

function HistoryDialog({ item, onClose, onRestore }: { item: Item; onClose: () => void; onRestore: (r: Revision) => void }) {
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    loadRevisions(item.table, item.id).then(setRevisions, (e) => setError(friendlyError(e)));
  }, [item.table, item.id]);

  return (
    <Modal title="Published versions" onClose={onClose}>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {!revisions && !error && <p className="text-jch-dim">Loading…</p>}
      {revisions?.length === 0 && <p className="text-jch-dim">This hasn't been published from the dashboard yet.</p>}
      {revisions && revisions.length > 0 && (
        <ol className="flex flex-col divide-y divide-black/10">
          {revisions.map((r, i) => (
            <li key={r.id} className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm">
                {new Date(r.published_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}
                {i === 0 && <span className="ml-2 text-xs font-semibold text-emerald-700">latest</span>}
              </span>
              <Button disabled={sameJson(r.content, item.row.draft)} onClick={() => onRestore(r)}>
                {sameJson(r.content, item.row.draft) ? "Same as draft" : "Restore as draft"}
              </Button>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}
