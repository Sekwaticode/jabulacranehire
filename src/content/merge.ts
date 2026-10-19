// Lays content from the database over the built-in defaults. Anything missing
// or of the wrong type falls back to the default, so a half-filled or damaged
// record can never crash a component. Empty strings are kept: an empty
// optional field (an image, the email) shows the component's empty state.

type Json = unknown;

const isObject = (value: Json): value is Record<string, Json> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** `template` decides the shape; `incoming` supplies values that fit it. */
export function mergeShape<T>(template: T, incoming: Json): T {
  if (incoming === undefined || incoming === null) return template;

  if (typeof template === "string") return (typeof incoming === "string" ? incoming : template) as T;
  if (typeof template === "number") {
    return (typeof incoming === "number" && Number.isFinite(incoming) ? incoming : template) as T;
  }
  if (typeof template === "boolean") return (typeof incoming === "boolean" ? incoming : template) as T;

  if (Array.isArray(template)) {
    if (!Array.isArray(incoming)) return template;
    const itemTemplate = template[0] ?? ITEM_TEMPLATE.get(template);
    // An empty default list gives no shape to check against; accept strings or
    // link-shaped objects, which is all such lists hold.
    if (itemTemplate === undefined) {
      return incoming.filter(
        (item) => typeof item === "string" || (isObject(item) && typeof item.label === "string" && typeof item.href === "string"),
      ) as T;
    }
    return incoming
      .filter((item) => (typeof itemTemplate === "string" ? typeof item === "string" : isObject(item) || Array.isArray(item)))
      .map((item) => mergeShape(blank(itemTemplate), item)) as T;
  }

  if (isObject(template)) {
    if (!isObject(incoming)) return template;
    const result: Record<string, Json> = {};
    for (const key of Object.keys(template)) result[key] = mergeShape(template[key], incoming[key]);
    // Optional keys the template may lack (image sizes, a spec's quote option).
    for (const key of OPTIONAL_KEYS) {
      if (!(key in template) && key in incoming) {
        const value = incoming[key];
        if (key === "quote" ? typeof value === "string" && value : typeof value === "number" && value > 0) {
          result[key] = value;
        }
      }
    }
    return result as T;
  }

  return template;
}

/** The template's shape with every value emptied, so a list item that lacks a
    field gets an empty one rather than another item's text. */
export function blank<T>(template: T): T {
  if (typeof template === "string") return "" as T;
  if (typeof template === "number") return 0 as T;
  if (typeof template === "boolean") return false as T;
  if (Array.isArray(template)) {
    const empty: Json[] = [];
    const item = template[0] ?? ITEM_TEMPLATE.get(template);
    if (item !== undefined) ITEM_TEMPLATE.set(empty, blank(item));
    return empty as T;
  }
  if (isObject(template)) {
    const result: Record<string, Json> = {};
    for (const key of Object.keys(template)) result[key] = blank(template[key]);
    return result as T;
  }
  return template;
}

// Remembers the item shape of lists emptied by blank().
const ITEM_TEMPLATE = new WeakMap<object, Json>();

const OPTIONAL_KEYS = ["width", "height", "quote"] as const;
