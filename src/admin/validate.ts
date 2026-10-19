// Checks a record against its field definitions before saving or publishing.
// "save" problems (bad links, text too long) block saving; "publish" problems
// (required text left empty, too few items) only block publishing, so a
// half-finished draft can still be saved.

import { imageSrcError, linkError } from "../content/links";
import type { Field } from "../content/schema";

export type Problem = { path: string; message: string; blocks: "save" | "publish" };

const EMAIL = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

type Obj = Record<string, unknown>;

export function validate(fields: Field[], value: unknown, base = ""): Problem[] {
  const problems: Problem[] = [];
  const obj = (value ?? {}) as Obj;
  const add = (path: string, message: string, blocks: Problem["blocks"]) => problems.push({ path, message, blocks });

  for (const field of fields) {
    const path = base ? `${base}.${field.key}` : field.key;
    const v = field.key ? obj[field.key] : value;

    switch (field.kind) {
      case "text": {
        const s = typeof v === "string" ? v : "";
        if (field.required !== false && !s.trim()) add(path, `${field.label} can't be empty.`, "publish");
        if (field.max && s.length > field.max) add(path, `${field.label} is too long (${s.length} of ${field.max} characters).`, "save");
        break;
      }
      case "link": {
        const link = (v ?? {}) as Obj;
        const label = String(link.label ?? "");
        const href = String(link.href ?? "");
        if (!label.trim()) add(`${path}.label`, `${field.label}: add a button label.`, "publish");
        if (label.length > 80) add(`${path}.label`, `${field.label}: the label is too long.`, "save");
        if (!href) add(`${path}.href`, `${field.label}: add where it goes.`, "publish");
        else {
          const error = linkError(href);
          if (error) add(`${path}.href`, `${field.label}: ${error}`, "save");
        }
        break;
      }
      case "href": {
        const href = String(v ?? "");
        if (!href) {
          if (field.required) add(path, `${field.label}: add where it goes.`, "publish");
        } else {
          const error = linkError(href);
          if (error) add(path, `${field.label}: ${error}`, "save");
        }
        break;
      }
      case "image": {
        const img = (v ?? {}) as Obj;
        const src = String(img.src ?? "");
        const error = imageSrcError(src);
        if (error) add(`${path}.src`, `${field.label}: ${error}`, "save");
        if (String(img.alt ?? "").length > 300) add(`${path}.alt`, `${field.label}: the description is too long.`, "save");
        if (src && field.requireSize && !(Number(img.width) > 0 && Number(img.height) > 0)) {
          add(`${path}.src`, `${field.label}: choose the photo again from the library so its size is known.`, "publish");
        }
        break;
      }
      case "select": {
        if (!field.options.some((o) => o.value === v)) add(path, `${field.label}: choose an option.`, "publish");
        break;
      }
      case "phone": {
        const digits = String(v ?? "").replace(/\D/g, "");
        if (digits.length < 9 || digits.length > 15) add(path, `${field.label}: enter a full phone number, like 013 241 1017.`, "save");
        break;
      }
      case "whatsapp": {
        const s = String(v ?? "");
        if (!/^[1-9][0-9]{7,14}$/.test(s)) {
          add(path, `${field.label}: use digits only with the country code, like 27799534581.`, "save");
        }
        break;
      }
      case "email": {
        const s = String(v ?? "");
        if (s && !EMAIL.test(s)) add(path, `${field.label}: that email address doesn't look right.`, "save");
        break;
      }
      case "group":
        problems.push(...validate(field.fields, v, path));
        break;
      case "strings": {
        const list = Array.isArray(v) ? v : [];
        if (field.min && list.length < field.min) add(path, `${field.label}: add at least ${field.min}.`, "publish");
        if (field.max && list.length > field.max) add(path, `${field.label}: no more than ${field.max}.`, "save");
        list.forEach((item, i) => {
          const s = String(item ?? "");
          if (!s.trim()) add(`${path}[${i}]`, `${field.label}: ${field.itemLabel.toLowerCase()} ${i + 1} is empty.`, "publish");
          if (s.length > (field.multiline ? 1500 : 300)) add(`${path}[${i}]`, `${field.label}: ${field.itemLabel.toLowerCase()} ${i + 1} is too long.`, "save");
        });
        break;
      }
      case "items": {
        const list = Array.isArray(v) ? v : [];
        if (field.min !== undefined && list.length < field.min) add(path, `${field.label}: add at least ${field.min}.`, "publish");
        if (field.max !== undefined && list.length > field.max) add(path, `${field.label}: no more than ${field.max}.`, "save");
        list.forEach((item, i) => problems.push(...validate(field.fields, item, `${path}[${i}]`)));
        break;
      }
      case "linkColumns": {
        const columns = Array.isArray(v) ? v : [];
        if (columns.length !== field.columns) add(path, `${field.label}: keep ${field.columns} columns.`, "save");
        columns.forEach((column, c) => {
          (Array.isArray(column) ? column : []).forEach((item, i) => {
            const link = (item ?? {}) as Obj;
            const where = `${path}[${c}][${i}]`;
            if (!String(link.label ?? "").trim()) add(`${where}.label`, `Column ${c + 1}, link ${i + 1}: add a label.`, "publish");
            const error = linkError(String(link.href ?? ""));
            if (error) add(`${where}.href`, `Column ${c + 1}, link ${i + 1}: ${error}`, "save");
          });
        });
        break;
      }
    }
  }
  return problems;
}

export const blocksSave = (problems: Problem[]) => problems.some((p) => p.blocks === "save");
