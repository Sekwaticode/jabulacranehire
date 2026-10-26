// Corporate stationery: logos, banners and business templates, ready to download.
// Files are read straight from the /logos folder at build time, so anything added
// there shows up here after the next deploy.

import { Download, FileSpreadsheet, FileText, Code2 } from "lucide-react";
import { Card, PageTitle } from "../ui";

type Asset = { name: string; url: string; ext: string };

function collect(files: Record<string, string>): Asset[] {
  return Object.entries(files)
    .map(([path, url]) => {
      const name = path.split("/").pop()!;
      return { name, url, ext: name.split(".").pop()!.toLowerCase() };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Vite needs these options written out literally in each call.
const logos = collect({
  ...import.meta.glob<string>("/logos/*.png", { query: "?url", import: "default", eager: true }),
  ...import.meta.glob<string>("/logos/svg/*.svg", { query: "?url", import: "default", eager: true }),
});
const banners = collect(import.meta.glob<string>("/logos/social-banners/*.png", { query: "?url", import: "default", eager: true }));
const templates = collect(import.meta.glob<string>("/logos/templates/*.{docx,xlsx}", { query: "?url", import: "default", eager: true }));
const letterheads = collect(import.meta.glob<string>("/logos/*.docx", { query: "?url", import: "default", eager: true }));

// HTML signatures are loaded as text (Vite would otherwise treat them as pages)
// and offered as a data: URL download.
const signatureHtml = Object.fromEntries(
  Object.entries(import.meta.glob<string>("/logos/email-signature/*.html", { query: "?raw", import: "default", eager: true })).map(
    ([path, html]) => [path, `data:text/html;charset=utf-8,${encodeURIComponent(html)}`],
  ),
);
const signatures = collect({
  ...import.meta.glob<string>("/logos/email-signature/*.png", { query: "?url", import: "default", eager: true }),
  ...signatureHtml,
});

/** "JCH-Facebook-Cover-1640x624.png" -> "Facebook Cover 1640x624" */
function prettyName(file: string) {
  return file
    .replace(/\.[^.]+$/, "")
    .replace(/^(JCH|Jabula-Crane-Hire)-/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\bX Twitter\b/, "X (Twitter)")
    .trim();
}

const isImage = (ext: string) => ext === "png" || ext === "svg" || ext === "jpg";
// "Dark" logo files are made for dark backgrounds, so preview them on one.
const onDark = (name: string) => /dark/i.test(name);

function DownloadLink({ asset, label }: { asset: Asset; label?: string }) {
  return (
    <a
      href={asset.url}
      download={asset.name}
      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-black/20 bg-white px-3 py-1.5 text-sm font-semibold text-jch-bg hover:border-jch-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jch-orange"
    >
      <Download aria-hidden className="size-4" />
      {label ?? asset.ext.toUpperCase()}
    </a>
  );
}

function Section({ id, title, lead, children }: { id: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mb-12">
      <h2 id={id} className="font-tight text-xl font-semibold text-jch-bg">
        {title}
      </h2>
      <p className="mt-1 mb-4 text-sm text-jch-dim">{lead}</p>
      {children}
    </section>
  );
}

/** Logos come as PNG + SVG pairs; group them into one card each. */
function LogoGrid() {
  const groups = new Map<string, Asset[]>();
  for (const a of logos) {
    const key = a.name.replace(/\.[^.]+$/, "");
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[...groups.entries()].map(([key, files]) => {
        const preview = files.find((f) => f.ext === "svg") ?? files[0];
        return (
          <li key={key}>
            <Card className="flex h-full flex-col overflow-hidden">
              <div className={`flex h-40 items-center justify-center p-6 ${onDark(key) ? "bg-jch-bg" : "bg-[#f4f4f2]"}`}>
                <img src={preview.url} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <p className="font-medium text-jch-bg">{prettyName(key)}</p>
                  <p className="text-xs text-jch-dim">{onDark(key) ? "For dark backgrounds" : "For light backgrounds"}</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  {files.map((f) => (
                    <DownloadLink key={f.name} asset={f} />
                  ))}
                </div>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

function ImageGrid({ assets }: { assets: Asset[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {assets.map((a) => (
        <li key={a.name}>
          <Card className="flex h-full flex-col overflow-hidden">
            <div className="flex h-44 items-center justify-center bg-[#f4f4f2] p-3">
              <img src={a.url} alt="" className="max-h-full max-w-full rounded object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <p className="font-medium text-jch-bg">{prettyName(a.name)}</p>
              <DownloadLink asset={a} />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

const fileIcon = { xlsx: FileSpreadsheet, docx: FileText, html: Code2 } as Record<string, typeof FileText>;
const fileKind: Record<string, string> = { xlsx: "Excel spreadsheet", docx: "Word document", html: "HTML signature", png: "Image" };

function FileList({ assets }: { assets: Asset[] }) {
  return (
    <Card>
      <ul className="divide-y divide-black/10">
        {assets.map((a) => {
          const Icon = fileIcon[a.ext] ?? FileText;
          return (
            <li key={a.name} className="flex items-center justify-between gap-4 px-5 py-3">
              <span className="flex min-w-0 items-center gap-3">
                <Icon aria-hidden className={`size-5 shrink-0 ${a.ext === "xlsx" ? "text-emerald-700" : "text-jch-orange"}`} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] font-medium text-jch-bg">{prettyName(a.name)}</span>
                  <span className="truncate text-xs text-jch-dim">
                    {fileKind[a.ext] ?? a.ext.toUpperCase()} · {a.name}
                  </span>
                </span>
              </span>
              <DownloadLink asset={a} label="Download" />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function StationeryScreen() {
  return (
    <>
      <PageTitle
        title="Corporate stationery"
        lead="Official Jabula Crane Hire logos, social media banners and business templates. Download what you need and always use these versions so the brand looks the same everywhere."
      />

      <Section id="logos-heading" title="Logo variations" lead="PNG for documents and social media, SVG for print and signage (scales to any size).">
        <LogoGrid />
      </Section>

      <Section id="templates-heading" title="Business templates" lead="Quotation, invoice and other documents with the company details already filled in.">
        <FileList assets={templates} />
      </Section>

      {letterheads.length > 0 && (
        <Section id="letterheads-heading" title="Letterheads" lead="Word letterheads for letters and official correspondence.">
          <FileList assets={letterheads} />
        </Section>
      )}

      <Section id="banners-heading" title="Social media banners" lead="Cover images sized for each platform. Upload the one that matches the platform name.">
        <ImageGrid assets={banners} />
      </Section>

      {signatures.length > 0 && (
        <Section id="signatures-heading" title="Email signatures" lead="Signature images and HTML versions for email clients.">
          <FileList assets={signatures} />
        </Section>
      )}
    </>
  );
}
