// Renders the form for any record from its field definitions. Every input is
// plain text: there are no style, HTML or component controls.

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { blank } from "../content/merge";
import type { Field } from "../content/schema";
import type { Img, Link } from "../content/types";
import { ImageField } from "./media";
import { Button, inputClass } from "./ui";
import type { Problem } from "./validate";

type Obj = Record<string, unknown>;

type Props = {
  fields: Field[];
  value: Obj;
  onChange: (value: Obj) => void;
  problems: Problem[];
  /** Shape used for new list items. */
  template: unknown;
  path?: string;
};

const fieldId = (path: string) => `f-${path.replace(/[^A-Za-z0-9_-]/g, "-")}`;

function Label({ htmlFor, label, help, required }: { htmlFor: string; label: string; help?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-jch-bg">
        {label}
        {required === false && <span className="ml-2 font-normal text-jch-dim">optional</span>}
      </label>
      {help && <p className="text-sm text-jch-dim">{help}</p>}
    </div>
  );
}

function ErrorText({ problem }: { problem?: Problem }) {
  if (!problem) return null;
  return <p className="text-sm text-red-700">{problem.message}</p>;
}

function TextInput({
  id,
  value,
  onChange,
  multiline,
  max,
  invalid,
  placeholder,
  type = "text",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  max?: number;
  invalid?: boolean;
  placeholder?: string;
  type?: string;
}) {
  const common = {
    id,
    value,
    placeholder,
    "aria-invalid": invalid || undefined,
    className: inputClass,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
  };
  return (
    <div className="flex flex-col gap-1">
      {multiline ? (
        <textarea {...common} rows={Math.min(8, Math.max(3, Math.ceil(value.length / 90)))} className={`${inputClass} resize-y`} />
      ) : (
        <input {...common} type={type} />
      )}
      {max && value.length > max * 0.8 && (
        <span className={`self-end text-xs ${value.length > max ? "text-red-700" : "text-jch-dim"}`}>
          {value.length} / {max}
        </span>
      )}
    </div>
  );
}

function ListControls({
  index,
  count,
  onMove,
  onRemove,
  canRemove,
  name,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  canRemove: boolean;
  name: string;
}) {
  const button = "inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-jch-dim hover:bg-black/5 hover:text-jch-bg disabled:opacity-30";
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={button} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${name} up`}>
        <ArrowUp aria-hidden className="size-4" />
      </button>
      <button type="button" className={button} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${name} down`}>
        <ArrowDown aria-hidden className="size-4" />
      </button>
      {canRemove && (
        <button type="button" className={`${button} hover:text-red-700`} onClick={onRemove} aria-label={`Remove ${name}`}>
          <Trash2 aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}

function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function LinkInputs({
  id,
  value,
  onChange,
  problems,
  path,
}: {
  id: string;
  value: Link;
  onChange: (v: Link) => void;
  problems: Problem[];
  path: string;
}) {
  const labelProblem = problems.find((p) => p.path === `${path}.label`);
  const hrefProblem = problems.find((p) => p.path === `${path}.href`);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-label`} className="text-xs font-medium text-jch-dim">
          Label
        </label>
        <TextInput id={`${id}-label`} value={value.label ?? ""} onChange={(label) => onChange({ ...value, label })} invalid={!!labelProblem} />
        <ErrorText problem={labelProblem} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-href`} className="text-xs font-medium text-jch-dim">
          Goes to
        </label>
        <TextInput
          id={`${id}-href`}
          value={value.href ?? ""}
          onChange={(href) => onChange({ ...value, href: href.trim() })}
          invalid={!!hrefProblem}
          placeholder="/contact#quote, https://…, mailto:… or tel:…"
        />
        <ErrorText problem={hrefProblem} />
      </div>
    </div>
  );
}

export function FieldsEditor({ fields, value, onChange, problems, template, path = "" }: Props) {
  const tmpl = (template ?? {}) as Obj;
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field) => {
        const p = path ? `${path}.${field.key}` : field.key;
        const id = fieldId(p);
        const problem = problems.find((x) => x.path === p);
        const v = value[field.key];
        let body: ReactNode;

        switch (field.kind) {
          case "text":
            body = (
              <>
                <Label htmlFor={id} label={field.label} help={field.help} required={field.required} />
                <TextInput
                  id={id}
                  value={typeof v === "string" ? v : ""}
                  onChange={(s) => set(field.key, s)}
                  multiline={field.multiline}
                  max={field.max}
                  invalid={!!problem}
                />
                <ErrorText problem={problem} />
              </>
            );
            break;
          case "phone":
          case "whatsapp":
          case "email":
          case "href":
            body = (
              <>
                <Label htmlFor={id} label={field.label} help={field.help} required={field.kind === "email" ? false : undefined} />
                <TextInput
                  id={id}
                  type={field.kind === "email" ? "email" : field.kind === "href" ? "text" : "tel"}
                  value={typeof v === "string" ? v : ""}
                  onChange={(s) => set(field.key, field.kind === "whatsapp" ? s.replace(/\D/g, "") : field.kind === "href" ? s.trim() : s)}
                  invalid={!!problem}
                  placeholder={field.kind === "href" ? "/contact#quote, https://…, mailto:… or tel:…" : undefined}
                />
                <ErrorText problem={problem} />
              </>
            );
            break;
          case "link":
            body = (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-semibold text-jch-bg">{field.label}</legend>
                {field.help && <p className="text-sm text-jch-dim">{field.help}</p>}
                <LinkInputs id={id} value={(v ?? { label: "", href: "" }) as Link} onChange={(l) => set(field.key, l)} problems={problems} path={p} />
              </fieldset>
            );
            break;
          case "image":
            body = (
              <ImageField
                id={id}
                label={field.label}
                help={field.help}
                value={(v ?? { src: "", alt: "" }) as Img}
                onChange={(img) => set(field.key, img)}
                error={problems.find((x) => x.path === `${p}.src`)?.message}
              />
            );
            break;
          case "select":
            body = (
              <>
                <Label htmlFor={id} label={field.label} help={field.help} />
                <select id={id} className={inputClass} value={String(v ?? "")} onChange={(e) => set(field.key, e.target.value)}>
                  {field.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ErrorText problem={problem} />
              </>
            );
            break;
          case "group":
            body = (
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 text-sm font-semibold text-jch-bg">{field.label}</legend>
                <FieldsEditor
                  fields={field.fields}
                  value={(v ?? {}) as Obj}
                  onChange={(g) => set(field.key, g)}
                  problems={problems}
                  template={tmpl[field.key]}
                  path={p}
                />
              </fieldset>
            );
            break;
          case "strings": {
            const list = (Array.isArray(v) ? v : []) as string[];
            const canAdd = !field.fixed && list.length < (field.max ?? 30);
            const canRemove = !field.fixed && list.length > (field.min ?? 0);
            body = (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-semibold text-jch-bg">{field.label}</legend>
                {field.help && <p className="text-sm text-jch-dim">{field.help}</p>}
                <ol className="flex flex-col gap-2">
                  {list.map((item, i) => {
                    const itemPath = `${p}[${i}]`;
                    const itemProblem = problems.find((x) => x.path === itemPath);
                    return (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-2.5 w-6 shrink-0 text-right text-xs text-jch-dim">{i + 1}.</span>
                        <div className="flex flex-1 flex-col gap-1">
                          <TextInput
                            id={fieldId(itemPath)}
                            value={item}
                            multiline={field.multiline}
                            invalid={!!itemProblem}
                            onChange={(s) => set(field.key, list.map((x, j) => (j === i ? s : x)))}
                          />
                          <ErrorText problem={itemProblem} />
                        </div>
                        <ListControls
                          index={i}
                          count={list.length}
                          name={`${field.itemLabel.toLowerCase()} ${i + 1}`}
                          canRemove={canRemove}
                          onMove={(to) => set(field.key, move(list, i, to))}
                          onRemove={() => set(field.key, list.filter((_, j) => j !== i))}
                        />
                      </li>
                    );
                  })}
                </ol>
                {canAdd && (
                  <Button variant="ghost" className="self-start" onClick={() => set(field.key, [...list, ""])}>
                    <Plus aria-hidden className="size-4" />
                    Add {field.itemLabel.toLowerCase()}
                  </Button>
                )}
                <ErrorText problem={problem} />
              </fieldset>
            );
            break;
          }
          case "items": {
            const list = (Array.isArray(v) ? v : []) as Obj[];
            const itemTemplate = blank(((Array.isArray(tmpl[field.key]) ? tmpl[field.key] : []) as unknown[])[0] ?? {}) as Obj;
            const canAdd = !field.fixed && list.length < (field.max ?? 30);
            const canRemove = !field.fixed && list.length > (field.min ?? 0);
            body = (
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 text-sm font-semibold text-jch-bg">{field.label}</legend>
                {field.help && <p className="text-sm text-jch-dim">{field.help}</p>}
                <ol className="flex flex-col gap-3">
                  {list.map((item, i) => (
                    <li key={i} className="rounded-lg border border-black/10 bg-[#faf9f7]">
                      <details open={list.length <= 4}>
                        <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 select-none">
                          <span className="truncate text-sm font-semibold">
                            {i + 1}. {String(item[field.titleKey] ?? "") || `New ${field.itemLabel.toLowerCase()}`}
                          </span>
                          {/* Keeps the arrow and remove buttons from also opening or closing the item. */}
                          <span onClick={(e) => e.preventDefault()}>
                            <ListControls
                              index={i}
                              count={list.length}
                              name={`${field.itemLabel.toLowerCase()} ${i + 1}`}
                              canRemove={canRemove}
                              onMove={(to) => set(field.key, move(list, i, to))}
                              onRemove={() => set(field.key, list.filter((_, j) => j !== i))}
                            />
                          </span>
                        </summary>
                        <div className="border-t border-black/10 px-4 py-4">
                          <FieldsEditor
                            fields={field.fields}
                            value={item}
                            template={itemTemplate}
                            problems={problems}
                            path={`${p}[${i}]`}
                            onChange={(next) => set(field.key, list.map((x, j) => (j === i ? next : x)))}
                          />
                        </div>
                      </details>
                    </li>
                  ))}
                </ol>
                {canAdd && (
                  <Button variant="ghost" className="self-start" onClick={() => set(field.key, [...list, structuredClone(itemTemplate)])}>
                    <Plus aria-hidden className="size-4" />
                    Add {field.itemLabel.toLowerCase()}
                  </Button>
                )}
                <ErrorText problem={problem} />
              </fieldset>
            );
            break;
          }
          case "linkColumns": {
            const columns = (Array.isArray(v) ? v : []) as Link[][];
            body = (
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 text-sm font-semibold text-jch-bg">{field.label}</legend>
                <div className="grid gap-4 lg:grid-cols-3">
                  {columns.map((column, c) => (
                    <div key={c} className="flex flex-col gap-3 rounded-lg border border-black/10 bg-[#faf9f7] p-3">
                      <p className="text-xs font-semibold tracking-wide text-jch-dim uppercase">Column {c + 1}</p>
                      {column.map((linkValue, i) => {
                        const linkPath = `${p}[${c}][${i}]`;
                        const update = (next: Link[]) => set(field.key, columns.map((col, k) => (k === c ? next : col)));
                        return (
                          <div key={i} className="flex flex-col gap-2 border-b border-black/10 pb-3 last:border-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-jch-dim">Link {i + 1}</span>
                              <ListControls
                                index={i}
                                count={column.length}
                                name={`link ${i + 1} in column ${c + 1}`}
                                canRemove={column.length > 0}
                                onMove={(to) => update(move(column, i, to))}
                                onRemove={() => update(column.filter((_, j) => j !== i))}
                              />
                            </div>
                            <LinkInputs
                              id={fieldId(linkPath)}
                              value={linkValue}
                              path={linkPath}
                              problems={problems}
                              onChange={(l) => update(column.map((x, j) => (j === i ? l : x)))}
                            />
                          </div>
                        );
                      })}
                      {column.length < 5 && (
                        <Button
                          variant="ghost"
                          className="self-start"
                          onClick={() => set(field.key, columns.map((col, k) => (k === c ? [...col, { label: "", href: "" }] : col)))}
                        >
                          <Plus aria-hidden className="size-4" />
                          Add link
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <ErrorText problem={problem} />
              </fieldset>
            );
            break;
          }
        }

        return (
          <div key={field.key || field.label} id={id + "-wrap"} className="flex flex-col gap-2">
            {body}
          </div>
        );
      })}
    </div>
  );
}
