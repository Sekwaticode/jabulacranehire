import { Building2, Cog, Factory, HardHat, type LucideIcon, Pickaxe, Route, Tractor, Wrench } from "lucide-react";

/** Icons an industry can show on the Home page. The CMS stores the key. */
export const industryIcons: Record<string, { icon: LucideIcon; label: string }> = {
  pickaxe: { icon: Pickaxe, label: "Pickaxe (mining)" },
  "hard-hat": { icon: HardHat, label: "Hard hat (construction)" },
  cog: { icon: Cog, label: "Cog (engineering)" },
  factory: { icon: Factory, label: "Factory (manufacturing)" },
  wrench: { icon: Wrench, label: "Wrench (industrial)" },
  route: { icon: Route, label: "Route (infrastructure)" },
  building: { icon: Building2, label: "Building (commercial)" },
  tractor: { icon: Tractor, label: "Tractor (agriculture)" },
};
