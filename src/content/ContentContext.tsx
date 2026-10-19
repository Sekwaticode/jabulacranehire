import { createContext, useContext } from "react";
import { defaultContent } from "./defaults";
import type { EquipmentItem, SiteContent } from "./types";

export const ContentContext = createContext<SiteContent>(defaultContent);

/** The content every public component renders. */
export function useContent() {
  return useContext(ContentContext);
}

/** Quote-form equipment options, built from the published equipment: each
    item's tonnage rows that link to the form, or the item's own option, then
    the "Not sure" option last. */
export function equipmentOptions(items: EquipmentItem[], notSure: string) {
  const options: string[] = [];
  for (const item of items) {
    const fromSpecs = item.specs.map((spec) => spec.quote ?? "").filter(Boolean);
    for (const option of fromSpecs.length ? fromSpecs : [item.quote]) {
      if (option && option !== notSure && !options.includes(option)) options.push(option);
    }
  }
  options.push(notSure);
  return options;
}
