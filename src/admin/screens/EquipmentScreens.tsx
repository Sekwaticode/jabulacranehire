import { type FormEvent, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, EyeOff, Plus, Trash2 } from "lucide-react";
import { safeImageSrc } from "../../content/links";
import { type EquipmentRow, useStore } from "../data";
import { RecordEditor } from "../RecordEditor";
import { Link, navigate } from "../router";
import { friendlyError, supabase } from "../supabase";
import { Button, Card, inputClass, Modal, PageTitle, StatusBadge, useConfirm, useToast } from "../ui";

export function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "item";
}

export function EquipmentList() {
  const store = useStore();
  const notify = useToast();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const rows = store.equipment;
  const itemFor = (row: EquipmentRow) => store.items.find((i) => i.table === "equipment" && i.id === row.id)!;

  const move = async (from: number, to: number) => {
    const ids = rows.map((r) => r.id);
    const [id] = ids.splice(from, 1);
    ids.splice(to, 0, id);
    setBusy(true);
    const { error } = await supabase!.rpc("cms_reorder_equipment", { p_ids: ids });
    if (error) notify("error", friendlyError(error));
    await store.reload();
    setBusy(false);
  };

  return (
    <>
      <PageTitle
        title="Equipment"
        lead="Each item fills an equipment card on the Home and Equipment pages, its pop-up, its Applications card and the quote form's equipment choices. A new order goes live when you publish the moved items."
        actions={
          <Button variant="dark" onClick={() => setAdding(true)}>
            <Plus aria-hidden className="size-4" />
            Add equipment
          </Button>
        }
      />
      <Card>
        <ol className="divide-y divide-black/10">
          {rows.map((row, i) => {
            const item = itemFor(row);
            const img = (row.draft.image ?? {}) as { src?: string };
            const src = safeImageSrc(img.src ?? "");
            return (
              <li key={row.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    aria-label={`Move ${String(row.draft.title)} up`}
                    disabled={i === 0 || busy}
                    onClick={() => void move(i, i - 1)}
                    className="cursor-pointer rounded p-1 text-jch-dim hover:bg-black/5 disabled:opacity-30"
                  >
                    <ArrowUp aria-hidden className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${String(row.draft.title)} down`}
                    disabled={i === rows.length - 1 || busy}
                    onClick={() => void move(i, i + 1)}
                    className="cursor-pointer rounded p-1 text-jch-dim hover:bg-black/5 disabled:opacity-30"
                  >
                    <ArrowDown aria-hidden className="size-4" />
                  </button>
                </div>
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-jch-bg">
                  {src ? (
                    <img src={src} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span aria-hidden className="flex gap-1">
                      {[0, 1, 2].map((k) => (
                        <span key={k} className="h-6 w-2 -skew-x-[20deg] bg-jch-orange" />
                      ))}
                    </span>
                  )}
                </div>
                <Link href={`/admin/equipment/${row.id}`} className="flex min-w-0 flex-1 flex-col hover:underline">
                  <span className="truncate font-semibold text-jch-bg">{String(row.draft.title || "Untitled")}</span>
                  <span className="truncate text-sm text-jch-dim">{String(row.draft.intro || "")}</span>
                </Link>
                <StatusBadge status={item.status} />
              </li>
            );
          })}
          {rows.length === 0 && <li className="p-8 text-center text-jch-dim">No equipment yet.</li>}
        </ol>
      </Card>
      {adding && <AddEquipment onClose={() => setAdding(false)} />}
    </>
  );
}

function AddEquipment({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const notify = useToast();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const name = title.trim();
    if (!name) return;
    setBusy(true);
    const base = slugify(name);
    let slug = base;
    for (let n = 2; store.equipment.some((e) => e.slug === slug); n++) slug = `${base}-${n}`;
    const { data, error } = await supabase!
      .from("equipment")
      .insert({
        slug,
        draft: { title: name, intro: "", image: { src: "", alt: "" }, specs: [], uses: [], applications: [], quote: name, note: "" },
        draft_sort_order: store.equipment.length,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      notify("error", friendlyError(error));
      return;
    }
    await store.reload();
    notify("success", "Equipment added as a draft. Fill it in, then publish it.");
    navigate(`/admin/equipment/${data.id}`);
  };

  return (
    <Modal title="Add equipment" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Name
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} required autoFocus />
        </label>
        <p className="text-sm text-jch-dim">It stays off the website until you publish it.</p>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="dark" disabled={busy || !title.trim()}>
            {busy ? "Adding…" : "Add"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function EquipmentEditor({ id }: { id: string }) {
  const store = useStore();
  const notify = useToast();
  const confirm = useConfirm();
  const row = store.equipment.find((e) => e.id === id);
  const item = store.items.find((i) => i.table === "equipment" && i.id === id);
  if (!row || !item) {
    return (
      <p>
        That equipment item no longer exists. <Link href="/admin/equipment" className="underline">Back to equipment</Link>
      </p>
    );
  }
  const name = String(row.draft.title || "this item");

  const unpublish = async () => {
    const ok = await confirm({
      title: `Hide ${name} from the website?`,
      message: "Its card, pop-up and quote option disappear from the site. You can publish it again any time.",
      confirmLabel: "Hide from website",
    });
    if (!ok) return;
    const { error } = await supabase!.rpc("cms_unpublish_equipment", { p_id: id });
    if (error) return notify("error", friendlyError(error));
    await store.reload();
    notify("success", `${name} is hidden from the website.`);
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${name}?`,
      message: "This removes it from the dashboard and the website for good. Published versions stay in the history log only. To take it off the site for now, hide it instead.",
      confirmLabel: "Delete for good",
      danger: true,
    });
    if (!ok) return;
    const { error } = await supabase!.from("equipment").delete().eq("id", id);
    if (error) return notify("error", friendlyError(error));
    navigate("/admin/equipment");
    await store.reload();
    notify("success", `${name} deleted.`);
  };

  return (
    <>
      <Link href="/admin/equipment" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-jch-dim hover:text-jch-bg">
        <ArrowLeft aria-hidden className="size-4" />
        All equipment
      </Link>
      <PageTitle
        title={name}
        lead="Shown as a card on the Home and Equipment pages, with these details in its pop-up. Only include specifications you can confirm."
      />
      <RecordEditor
        item={item}
        title="Details"
        defaultOpen
        extraActions={
          <>
            {row.is_published && (
              <Button variant="ghost" onClick={() => void unpublish()}>
                <EyeOff aria-hidden className="size-4" />
                Hide from website
              </Button>
            )}
            <Button variant="danger" onClick={() => void remove()}>
              <Trash2 aria-hidden className="size-4" />
              Delete
            </Button>
          </>
        }
      />
    </>
  );
}
