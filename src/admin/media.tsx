// Media library: uploads to the public site-media bucket, image fields and
// the picker. Replacing an image only swaps the file; the component on the
// site keeps its own size, crop and object-fit.

import { useRef, useState } from "react";
import { ImagePlus, Images, Trash2, Upload } from "lucide-react";
import { safeImageSrc } from "../content/links";
import { pageSchema, settingsSchema } from "../content/schema";
import type { Img } from "../content/types";
import { type MediaRow, useStore } from "./data";
import { friendlyError, MEDIA_BUCKET, supabase } from "./supabase";
import { Button, Card, inputClass, Modal, PageTitle, useConfirm, useToast } from "./ui";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_BYTES = 5 * 1024 * 1024;

export function publicUrl(path: string) {
  return supabase!.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function checkFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return `${file.name} isn't a JPEG, PNG or WebP image.`;
  if (file.size > MAX_BYTES) return `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`;
  return null;
}

async function imageSize(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    throw new Error(`${file.name} couldn't be read as an image.`);
  }
}

export async function uploadImage(file: File, altText = ""): Promise<MediaRow> {
  const problem = checkFile(file);
  if (problem) throw new Error(problem);
  const { width, height } = await imageSize(file);
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type]!;
  const now = new Date();
  const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;

  const upload = await supabase!.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (upload.error) throw upload.error;

  const { data, error } = await supabase!
    .from("media")
    .insert({
      file_path: path,
      original_filename: file.name.slice(0, 255),
      mime_type: file.type,
      file_size: file.size,
      width,
      height,
      alt_text: altText.slice(0, 300),
    })
    .select()
    .single();
  if (error) {
    await supabase!.storage.from(MEDIA_BUCKET).remove([path]);
    throw error;
  }
  return data as MediaRow;
}

/** "page_sections:home.safety" → "Home: 5. Safety & operators". */
function describeUsage(entry: string) {
  const [table, key] = entry.split(":");
  if (table === "page_sections") {
    const [slug, section] = key.split(".");
    const page = pageSchema[slug as keyof typeof pageSchema];
    return `${page?.label ?? slug}: ${page?.sections.find((s) => s.key === section)?.label ?? section}`;
  }
  if (table === "site_settings") return `Settings: ${settingsSchema.find((s) => s.key === key)?.label ?? key}`;
  if (table === "equipment") return `Equipment: ${key}`;
  return "The last published version of an item (publish its replacement first)";
}

export async function mediaUsage(path: string) {
  const { data, error } = await supabase!.rpc("cms_media_usage", { p_path: path });
  if (error) throw error;
  return [...new Set((data as string[]).map(describeUsage))];
}

function Thumb({ media, className = "" }: { media: MediaRow; className?: string }) {
  return (
    <img
      src={publicUrl(media.file_path)}
      alt={media.alt_text || media.original_filename}
      loading="lazy"
      className={`h-full w-full bg-[repeating-conic-gradient(#eee_0_25%,#fff_0_50%)] bg-[length:16px_16px] object-contain ${className}`}
    />
  );
}

export function MediaPicker({ onPick, onClose }: { onPick: (media: MediaRow) => void; onClose: () => void }) {
  const { media, reload } = useStore();
  const notify = useToast();
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const row = await uploadImage(file);
      await reload();
      notify("success", "Image uploaded.");
      onPick(row);
    } catch (e) {
      notify("error", friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Choose an image" onClose={onClose} wide>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="dark" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden className="size-4" />
            {busy ? "Uploading…" : "Upload a new image"}
          </Button>
          <span className="text-sm text-jch-dim">JPEG, PNG or WebP, up to 5 MB.</span>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            aria-label="Upload a new image"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        {media.length === 0 ? (
          <p className="rounded-lg bg-black/5 p-6 text-center text-jch-dim">No images uploaded yet.</p>
        ) : (
          <ul className="grid max-h-[60svh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
            {media.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onPick(m)}
                  className="group flex w-full cursor-pointer flex-col gap-1 rounded-lg border border-black/10 p-2 text-left hover:border-jch-orange focus-visible:outline-2 focus-visible:outline-jch-orange"
                >
                  <span className="block aspect-[4/3] overflow-hidden rounded-md">
                    <Thumb media={m} />
                  </span>
                  <span className="truncate text-xs text-jch-dim">{m.alt_text || m.original_filename}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

/** Edits one image slot: preview, choose or upload, description, remove. */
export function ImageField({
  id,
  label,
  help,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  help?: string;
  value: Img;
  onChange: (value: Img) => void;
  error?: string;
}) {
  const [picking, setPicking] = useState(false);
  const src = safeImageSrc(value.src);
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-semibold text-jch-bg">{label}</legend>
      {help && <p className="-mt-1 text-sm text-jch-dim">{help}</p>}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-[repeating-conic-gradient(#eee_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
          {src ? (
            <img src={src} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="px-3 text-center text-xs text-jch-dim">No image. The site shows its placeholder.</span>
          )}
        </div>
        <div className="flex min-w-[240px] flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setPicking(true)}>
              {src ? <Images aria-hidden className="size-4" /> : <ImagePlus aria-hidden className="size-4" />}
              {src ? "Replace image" : "Add image"}
            </Button>
            {src && (
              <Button variant="ghost" onClick={() => onChange({ src: "", alt: value.alt })}>
                <Trash2 aria-hidden className="size-4" />
                Remove
              </Button>
            )}
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-jch-bg">Image description (alt text)</span>
            <input
              id={`${id}-alt`}
              className={inputClass}
              value={value.alt}
              maxLength={300}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
              placeholder="What the photo shows, for screen readers and search engines"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(m) => {
            setPicking(false);
            onChange({
              src: publicUrl(m.file_path),
              alt: value.alt || m.alt_text,
              ...(m.width && m.height ? { width: m.width, height: m.height } : {}),
            });
          }}
        />
      )}
    </fieldset>
  );
}

export function MediaLibrary() {
  const { media, reload } = useStore();
  const notify = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    let done = 0;
    for (const file of Array.from(files)) {
      try {
        await uploadImage(file);
        done++;
      } catch (e) {
        notify("error", friendlyError(e));
      }
    }
    await reload();
    setBusy(false);
    if (done) notify("success", `${done} image${done === 1 ? "" : "s"} uploaded.`);
  };

  const saveAlt = async (m: MediaRow, alt: string) => {
    if (alt === m.alt_text) return;
    const { error } = await supabase!.from("media").update({ alt_text: alt }).eq("id", m.id);
    if (error) notify("error", friendlyError(error));
    else {
      notify("success", "Description saved. It is suggested when this image is chosen.");
      await reload();
    }
  };

  const remove = async (m: MediaRow) => {
    try {
      const usage = await mediaUsage(m.file_path);
      if (usage.length) {
        notify("error", `This image is still used in: ${usage.join("; ")}. Replace it there first.`);
        return;
      }
      const ok = await confirm({
        title: "Delete this image?",
        message: "It isn't used anywhere on the site. Deleting it can't be undone.",
        confirmLabel: "Delete image",
        danger: true,
      });
      if (!ok) return;
      const removed = await supabase!.storage.from(MEDIA_BUCKET).remove([m.file_path]);
      if (removed.error) throw removed.error;
      const { error } = await supabase!.from("media").delete().eq("id", m.id);
      if (error) throw error;
      await reload();
      notify("success", "Image deleted.");
    } catch (e) {
      notify("error", friendlyError(e));
    }
  };

  return (
    <>
      <PageTitle
        title="Media library"
        lead="Images for the website. Uploads are public as soon as a published section uses them. Images in use can't be deleted."
        actions={
          <>
            <Button variant="dark" disabled={busy} onClick={() => fileRef.current?.click()}>
              <Upload aria-hidden className="size-4" />
              {busy ? "Uploading…" : "Upload images"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              aria-label="Upload images"
              onChange={(e) => {
                void upload(e.target.files);
                e.target.value = "";
              }}
            />
          </>
        }
      />
      {media.length === 0 ? (
        <Card className="p-10 text-center text-jch-dim">No images yet. JPEG, PNG or WebP, up to 5 MB each.</Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((m) => (
            <li key={m.id}>
              <Card className="flex flex-col overflow-hidden">
                <div className="aspect-[4/3]">
                  <Thumb media={m} />
                </div>
                <div className="flex flex-col gap-2 p-3">
                  <p className="truncate text-xs text-jch-dim" title={m.original_filename}>
                    {m.original_filename} · {m.width}×{m.height} · {Math.round(m.file_size / 1024)} KB
                  </p>
                  <label className="flex flex-col gap-1 text-xs font-medium">
                    Description
                    <input
                      className={inputClass}
                      defaultValue={m.alt_text}
                      maxLength={300}
                      onBlur={(e) => void saveAlt(m, e.target.value)}
                    />
                  </label>
                  <Button variant="danger" className="self-start" onClick={() => void remove(m)}>
                    <Trash2 aria-hidden className="size-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
