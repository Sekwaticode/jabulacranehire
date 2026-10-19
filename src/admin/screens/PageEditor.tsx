import { Eye, ExternalLink } from "lucide-react";
import { pageSchema } from "../../content/schema";
import type { PageSlug } from "../../content/types";
import { useStore } from "../data";
import { openPreview } from "../preview";
import { RecordEditor } from "../RecordEditor";
import { Link } from "../router";
import { Button, PageTitle, useToast } from "../ui";

export function PageEditor({ slug }: { slug: PageSlug }) {
  const store = useStore();
  const notify = useToast();
  const schema = pageSchema[slug];
  const page = store.pages.find((p) => p.slug === slug);
  if (!schema || !page) return <p>That page doesn't exist.</p>;

  const seo = store.items.find((i) => i.table === "pages" && i.id === page.id);
  const sections = schema.sections
    .map((def) => ({ def, item: store.items.find((i) => i.table === "page_sections" && i.href.endsWith(`/${slug}#${def.key}`)) }))
    .filter((s) => s.item);

  return (
    <>
      <PageTitle
        title={`${schema.label} page`}
        lead={
          <>
            Sections are listed in the order they appear on the page. Open one to edit its words, links and images. The design, layout and
            animations stay as they are.
            {slug === "home" && (
              <>
                {" "}
                Equipment cards come from <Link href="/admin/equipment" className="underline">Equipment</Link>.
              </>
            )}
          </>
        }
        actions={
          <>
            <Button onClick={() => openPreview(schema.path, store.draftContent()) || notify("error", "Allow pop-ups for this site to preview.")}>
              <Eye aria-hidden className="size-4" />
              Preview drafts
            </Button>
            <a
              href={schema.path}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-jch-bg hover:bg-black/5"
            >
              <ExternalLink aria-hidden className="size-4" />
              View live page
            </a>
          </>
        }
      />
      <div className="flex flex-col gap-4">
        {sections.map(({ def, item }) => (
          <RecordEditor key={item!.id} item={item!} anchor={def.key} title={def.label} help={def.help} />
        ))}
        {seo && (
          <RecordEditor
            item={seo}
            anchor="seo"
            title="Search & browser title"
            subtitle="The title in the browser tab and Google, and the description under it."
          />
        )}
      </div>
    </>
  );
}
