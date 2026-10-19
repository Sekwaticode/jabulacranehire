import { useState } from "react";
import { Eye, FileText, Images, Settings, Truck, Upload } from "lucide-react";
import { pageSchema } from "../../content/schema";
import { publishAll, statusLabel, type Status, useStore } from "../data";
import { openPreview } from "../preview";
import { Link } from "../router";
import { friendlyError } from "../supabase";
import { Button, Card, formatWhen, PageTitle, StatusBadge, useConfirm, useToast } from "../ui";

export function Overview() {
  const store = useStore();
  const notify = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const { items } = store;

  const count = (status: Status) => items.filter((i) => i.status === status).length;
  const pending = items.filter((i) => i.status === "changed" || i.status === "new");
  const recent = [...items].sort((a, b) => b.row.draft_updated_at.localeCompare(a.row.draft_updated_at)).slice(0, 8);
  const lastPublished = items.map((i) => i.row.published_at ?? "").sort().at(-1) || null;

  const doPublishAll = async () => {
    const ok = await confirm({
      title: `Publish ${pending.length} change${pending.length === 1 ? "" : "s"}?`,
      message: (
        <ul className="list-disc pl-5">
          {pending.slice(0, 12).map((i) => (
            <li key={i.id}>{i.label}</li>
          ))}
          {pending.length > 12 && <li>and {pending.length - 12} more</li>}
        </ul>
      ),
      confirmLabel: "Publish all",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const n = await publishAll();
      await store.reload();
      notify("success", `Published ${n} item${n === 1 ? "" : "s"}. Visitors see the changes on their next page load.`);
    } catch (e) {
      notify("error", friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const stats: { label: string; value: number; note: string }[] = [
    { label: "Editable items", value: items.length, note: "Sections, settings, page titles and equipment" },
    { label: "Live and up to date", value: count("live"), note: statusLabel.live },
    { label: "Waiting to publish", value: count("changed") + count("new"), note: "Saved drafts not on the site yet" },
    { label: "Hidden", value: count("unpublished"), note: "Equipment taken off the site" },
  ];

  const quick = [
    ...Object.entries(pageSchema).map(([slug, page]) => ({ href: `/admin/pages/${slug}`, label: `${page.label} page`, icon: FileText })),
    { href: "/admin/equipment", label: "Equipment", icon: Truck },
    { href: "/admin/settings", label: "Business details & settings", icon: Settings },
    { href: "/admin/media", label: "Media library", icon: Images },
  ];

  return (
    <>
      <PageTitle
        title="Overview"
        lead={
          <>
            Edits are saved as drafts and only reach the website when you publish them. Last publish: {formatWhen(lastPublished)}.
          </>
        }
        actions={
          <>
            <Button onClick={() => openPreview("/", store.draftContent()) || notify("error", "Allow pop-ups for this site to preview.")}>
              <Eye aria-hidden className="size-4" />
              Preview drafts
            </Button>
            <Button variant="primary" disabled={!pending.length || busy} onClick={() => void doPublishAll()}>
              <Upload aria-hidden className="size-4" />
              {busy ? "Publishing…" : pending.length ? `Publish all changes (${pending.length})` : "Everything is published"}
            </Button>
          </>
        }
      />

      <ul className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Card className="flex h-full flex-col gap-1 p-5">
              <span className="text-sm font-medium text-jch-dim">{s.label}</span>
              <span className="font-tight text-4xl font-semibold text-jch-bg">{s.value}</span>
              <span className="text-xs text-jch-dim">{s.note}</span>
            </Card>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="mb-3 font-tight text-xl font-semibold text-jch-bg">
            Recently edited
          </h2>
          <Card>
            <ul className="divide-y divide-black/10">
              {recent.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-black/[0.02]">
                    <span className="flex flex-col">
                      <span className="text-[15px] font-medium text-jch-bg">{item.label}</span>
                      <span className="text-xs text-jch-dim">Edited {formatWhen(item.row.draft_updated_at)}</span>
                    </span>
                    <StatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section aria-labelledby="quick-heading">
          <h2 id="quick-heading" className="mb-3 font-tight text-xl font-semibold text-jch-bg">
            Manage the website
          </h2>
          <ul className="grid gap-2">
            {quick.map((q) => (
              <li key={q.href}>
                <Link
                  href={q.href}
                  className="flex items-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 font-medium text-jch-bg hover:border-jch-orange"
                >
                  <q.icon aria-hidden className="size-5 text-jch-orange" />
                  {q.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
