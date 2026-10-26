// What the dashboard can edit, and which existing component shows it.
//
// Each section maps to one existing component (`component`), and its fields
// mirror that component's content. The database seeds its rows from this
// registry (scripts/generate-seed.ts), so the two never drift apart.
// Nothing here can add components, change layout or carry markup.

import type { PageSlug } from "./types";

type Base = { key: string; label: string; help?: string };

export type Field =
  | (Base & { kind: "text"; required?: boolean; max?: number; multiline?: boolean })
  | (Base & { kind: "link"; required?: boolean })
  | (Base & { kind: "href"; required?: boolean })
  | (Base & { kind: "image"; requireSize?: boolean })
  | (Base & { kind: "select"; options: { value: string; label: string }[] })
  | (Base & { kind: "phone" })
  | (Base & { kind: "email" })
  | (Base & { kind: "whatsapp" })
  | (Base & { kind: "group"; fields: Field[] })
  | (Base & { kind: "strings"; itemLabel: string; min?: number; max?: number; fixed?: boolean; multiline?: boolean })
  | (Base & {
      kind: "items";
      itemLabel: string;
      /** Field shown as each item's title in the list. */
      titleKey: string;
      fields: Field[];
      min?: number;
      max?: number;
      /** The design is built for exactly this many items. */
      fixed?: boolean;
    })
  | (Base & { kind: "linkColumns"; columns: number });

export type SectionDef = { key: string; component: string; label: string; help?: string; fields: Field[] };
export type SettingDef = { key: string; label: string; description: string; fields: Field[] };

const t = (key: string, label: string, extra: Partial<Extract<Field, { kind: "text" }>> = {}): Field => ({
  kind: "text",
  key,
  label,
  required: true,
  max: 300,
  ...extra,
});
const para = (key: string, label: string, extra: Partial<Extract<Field, { kind: "text" }>> = {}): Field =>
  t(key, label, { multiline: true, max: 1500, ...extra });
const link = (key: string, label: string): Field => ({ kind: "link", key, label, required: true });
const image = (key: string, label: string, help?: string): Field => ({ kind: "image", key, label, help });
const list = (key: string, label: string, itemLabel: string, extra: Partial<Extract<Field, { kind: "strings" }>> = {}): Field => ({
  kind: "strings",
  key,
  label,
  itemLabel,
  min: 1,
  max: 30,
  ...extra,
});

const eyebrow = t("eyebrow", "Small heading above the title", { max: 80 });
const title = t("title", "Heading", { max: 160 });
const lead = para("lead", "Intro text", { max: 600 });
const heading = [eyebrow, title, lead];

const pageHeader = (): SectionDef => ({
  key: "header",
  component: "PageHeader",
  label: "Page header",
  fields: [...heading, image("image", "Background photo", "Optional. Without a photo the orange slashes show.")],
});

const ctaBanner = (): SectionDef => ({
  key: "cta",
  component: "CtaBanner",
  label: "Orange closing banner",
  fields: [
    title,
    t("callLabel", "Call button word", { max: 30, help: "Shown before the office number, e.g. “Call 013 241 1017”." }),
    link("action", "Second button"),
  ],
});

export const pageSchema: Record<PageSlug, { label: string; path: string; sections: SectionDef[] }> = {
  home: {
    label: "Home",
    path: "/",
    sections: [
      {
        key: "hero",
        component: "HomeHero",
        label: "1. Hero",
        fields: [
          t("title", "Main heading", { max: 120, help: "Each sentence starts a new line." }),
          link("primary", "Main button"),
          list("highlights", "Ticks along the bottom", "Highlight", { max: 4 }),
          t("callLabel", "Call link words", { max: 40, help: "Shown before the office number, bottom right." }),
          image("image", "Background photo", "Darkened toward the bottom so the heading stays readable."),
          {
            kind: "group",
            key: "equipmentCard",
            label: "Equipment card (bottom right)",
            fields: [
              t("title", "Card heading", { max: 80 }),
              link("link", "Card link"),
              image("image", "Card picture", "A machine on a plain or see-through background works best."),
            ],
          },
        ],
      },
      {
        key: "trust",
        component: "LogoLoop",
        label: "2. Scrolling facts strip",
        fields: [list("items", "Facts", "Fact", { max: 10 })],
      },
      {
        key: "equipment",
        component: "EquipmentGrid",
        label: "3. Our equipment",
        fields: [...heading, link("button", "Button under the cards")],
      },
      {
        key: "industries",
        component: "Industries",
        label: "4. Industries we serve",
        fields: [
          eyebrow,
          title,
          {
            kind: "items",
            key: "items",
            label: "Industries",
            itemLabel: "Industry",
            titleKey: "name",
            min: 1,
            max: 16,
            fields: [
              t("name", "Name", { max: 40 }),
              para("text", "Description", { max: 200 }),
              {
                kind: "select",
                key: "icon",
                label: "Icon",
                options: [
                  { value: "pickaxe", label: "Pickaxe (mining)" },
                  { value: "hard-hat", label: "Hard hat (construction)" },
                  { value: "cog", label: "Cog (engineering)" },
                  { value: "factory", label: "Factory (manufacturing)" },
                  { value: "wrench", label: "Wrench (industrial)" },
                  { value: "route", label: "Route (infrastructure)" },
                  { value: "building", label: "Building (commercial)" },
                  { value: "tractor", label: "Tractor (agriculture)" },
                ],
              },
            ],
          },
        ],
      },
      {
        key: "safety",
        component: "Safety",
        label: "5. Safety & operators",
        fields: [
          ...heading,
          list("checklist", "Checklist", "Item", { max: 12 }),
          para("operatorNote", "Operator note", { max: 600 }),
          link("button", "Button"),
          image("photo", "Photo", "Optional. Without a photo a branded panel shows the caption."),
          t("caption", "Caption on the branded panel", { max: 60 }),
        ],
      },
      {
        key: "hireOptions",
        component: "HireOptions",
        label: "6. Hire options",
        fields: [
          ...heading,
          t("suitableForLabel", "Label above each list", { max: 40 }),
          {
            kind: "items",
            key: "options",
            label: "Hire options",
            itemLabel: "Option",
            titleKey: "title",
            min: 1,
            max: 6,
            fields: [t("title", "Name", { max: 40 }), list("suitableFor", "Suitable for", "Item", { max: 12 })],
          },
          link("button", "Button"),
        ],
      },
      {
        key: "process",
        component: "Timeline",
        label: "How a hire works",
        fields: [
          t("title", "Heading", { max: 60 }),
          t("periodLabel", "Small label under the heading", { max: 60 }),
          {
            kind: "items",
            key: "steps",
            label: "Steps",
            itemLabel: "Step",
            titleKey: "title",
            fixed: true,
            min: 7,
            max: 7,
            help: "The scrolling timeline is built for exactly seven steps, so steps can be reworded but not added or removed.",
            fields: [t("title", "Step title", { max: 60 }), para("content", "Step text", { max: 200 })],
          },
          image("image", "Photo beside the timeline"),
        ],
      },
      {
        key: "quote",
        component: "QuoteSection",
        label: "7. Quote request",
        fields: [eyebrow, title, para("intro", "Intro text", { max: 400 })],
      },
    ],
  },
  about: {
    label: "About",
    path: "/about",
    sections: [
      pageHeader(),
      {
        key: "intro",
        component: "AboutIntro",
        label: "Who we are",
        fields: [eyebrow, title, list("paragraphs", "Paragraphs", "Paragraph", { multiline: true, max: 6 })],
      },
      {
        key: "visionMission",
        component: "VisionMission",
        label: "Vision and mission",
        fields: [
          t("visionLabel", "Vision label", { max: 40 }),
          para("vision", "Vision"),
          t("missionLabel", "Mission label", { max: 40 }),
          para("mission", "Mission"),
          t("pointsLabel", "Label above the list", { max: 40 }),
          list("points", "Mission points", "Point", { max: 12 }),
        ],
      },
      {
        key: "commitment",
        component: "Commitment",
        label: "Our service commitment",
        fields: [eyebrow, title, list("paragraphs", "Paragraphs", "Paragraph", { multiline: true, max: 4 })],
      },
      {
        key: "quality",
        component: "Quality",
        label: "Quality & reliability",
        fields: [...heading, list("items", "Items", "Item", { max: 16 })],
      },
      {
        key: "whyChoose",
        component: "WhyChoose",
        label: "Why choose Jabula",
        fields: [
          eyebrow,
          title,
          {
            kind: "items",
            key: "reasons",
            label: "Reasons",
            itemLabel: "Reason",
            titleKey: "title",
            min: 1,
            max: 12,
            fields: [t("title", "Title", { max: 60 }), para("text", "Text", { max: 300 })],
          },
        ],
      },
      {
        key: "clients",
        component: "Clients",
        label: "Who we work with",
        fields: [eyebrow, title, list("items", "Client types", "Client type", { max: 40 })],
      },
      {
        key: "credentials",
        component: "Credentials",
        label: "Company credentials",
        fields: [
          ...heading,
          t("downloadLabel", "Button when a profile PDF is set", { max: 60 }),
          t("requestLabel", "Button when no PDF is set", { max: 60 }),
          { kind: "href", key: "requestHref", label: "Where that button goes", required: true },
        ],
      },
      ctaBanner(),
    ],
  },
  equipment: {
    label: "Equipment",
    path: "/equipment",
    sections: [
      pageHeader(),
      { key: "fleet", component: "EquipmentGrid", label: "Our equipment", fields: heading },
      {
        key: "applications",
        component: "Applications",
        label: "Applications",
        fields: [eyebrow, title, para("footnote", "Note under the cards", { max: 400 })],
      },
      ctaBanner(),
    ],
  },
  careers: {
    label: "Careers",
    path: "/careers",
    sections: [
      pageHeader(),
      {
        key: "intro",
        component: "CareersIntro",
        label: "Working here",
        fields: [eyebrow, title, list("paragraphs", "Paragraphs", "Paragraph", { multiline: true, max: 6 })],
      },
      {
        key: "teams",
        component: "Teams",
        label: "Teams slider",
        fields: [
          t("title", "Scrolling title", { max: 60 }),
          {
            kind: "items",
            key: "items",
            label: "Teams",
            itemLabel: "Team",
            titleKey: "name",
            min: 1,
            max: 8,
            fields: [
              t("name", "Team name", { max: 60 }),
              t("role", "Role line", { max: 80 }),
              para("text", "Description", { max: 400 }),
              image("image", "Photo", "Optional. Without a photo a branded panel shows the team name."),
            ],
          },
        ],
      },
      {
        key: "expectations",
        component: "Expectations",
        label: "What we expect",
        fields: [...heading, list("items", "Expectations", "Item", { max: 16 })],
      },
      {
        key: "cta",
        component: "CtaBanner",
        label: "Orange closing banner",
        fields: [
          title,
          t("callLabel", "Call button word", { max: 30 }),
          t("actionLabel", "WhatsApp button label", { max: 40 }),
          para("whatsappMessage", "Message the WhatsApp button starts with", { max: 300 }),
        ],
      },
    ],
  },
  contact: {
    label: "Contact",
    path: "/contact",
    sections: [
      pageHeader(),
      {
        key: "quote",
        component: "QuoteForm",
        label: "Quote request panel",
        help: "The form fields, checks and WhatsApp/email sending stay as built. Equipment options come from the equipment list; durations from Settings.",
        fields: [
          t("title", "Panel heading", { max: 60 }),
          t("privacyTitle", "Privacy notice title", { max: 60 }),
          para("privacyText", "Privacy notice", { max: 800 }),
        ],
      },
      {
        key: "reachUs",
        component: "ContactDetails",
        label: "Reach us directly",
        fields: [t("title", "Panel heading", { max: 60 })],
      },
      {
        key: "faqs",
        component: "Faqs",
        label: "FAQs",
        fields: [
          ...heading,
          {
            kind: "items",
            key: "items",
            label: "Questions",
            itemLabel: "Question",
            titleKey: "q",
            min: 0,
            max: 40,
            fields: [t("q", "Question", { max: 200 }), para("a", "Answer", { max: 1500 })],
          },
        ],
      },
    ],
  },
};

export const seoFields: Field[] = [
  t("title", "Browser tab and search title", { max: 70, help: "Shown in the browser tab and Google results. Aim for under 60 characters." }),
  para("description", "Search description", { max: 300, help: "Shown under the title in Google results. Aim for 120 to 160 characters." }),
];

const linkItems = (key: string, label: string, max = 12, min = 0, help?: string): Field => ({
  kind: "items",
  key,
  label,
  help,
  itemLabel: "Link",
  titleKey: "label",
  min,
  max,
  fields: [t("label", "Label", { max: 60 }), { kind: "href", key: "href", label: "Goes to", required: true }],
});

export const settingsSchema: SettingDef[] = [
  {
    key: "business",
    label: "Business details",
    description: "Name, phone numbers, WhatsApp, email, address and hours. Used across every page.",
    fields: [
      t("name", "Business name", { max: 80 }),
      t("legalName", "Registered name", { max: 120 }),
      t("tagline", "Tagline", { max: 120 }),
      t("slogan", "Slogan", { max: 120 }),
      { kind: "group", key: "phone", label: "Office phone", fields: [{ kind: "phone", key: "display", label: "Office number" }] },
      {
        kind: "group",
        key: "mobile",
        label: "Mobile phone",
        fields: [{ kind: "phone", key: "display", label: "Mobile and after-hours number" }],
      },
      {
        kind: "whatsapp",
        key: "whatsappNumber",
        label: "WhatsApp number",
        help: "International format without spaces or +, e.g. 27799534581.",
      },
      para("whatsappMessage", "WhatsApp starter message", { max: 300 }),
      { kind: "email", key: "email", label: "Email address", help: "Optional. Hidden on the site while empty." },
      list("addressLines", "Address", "Line", { max: 4 }),
      t("mapQuery", "Address for the map", { max: 200, help: "What Google Maps searches for on the Contact page." }),
      t("hours", "Operating hours", { max: 120 }),
    ],
  },
  {
    key: "credentials",
    label: "Company credentials",
    description: "The credentials table on the About page.",
    fields: [
      {
        kind: "items",
        key: "rows",
        label: "Rows",
        itemLabel: "Row",
        titleKey: "label",
        min: 1,
        max: 16,
        fields: [
          t("label", "Label", { max: 80 }),
          t("value", "Value", { required: false, max: 120, help: "Leave empty to show “Available on request”." }),
        ],
      },
      {
        kind: "href",
        key: "companyProfilePdf",
        label: "Company profile PDF link",
        help: "Optional. An https:// link or a file path on this site. Empty shows “Request our company profile”.",
      },
    ],
  },
  {
    key: "brand",
    label: "Logo",
    description: "The logo in the top bar and footer.",
    fields: [
      image("logo", "Logo image"),
      t("footerLogoAlt", "Footer logo description", { max: 120 }),
    ],
  },
  {
    key: "navigation",
    label: "Menu",
    description: "The slide-out menu. The office number is always the last link.",
    fields: [
      { kind: "linkColumns", key: "columns", label: "Menu columns", columns: 3 },
      t("callLabel", "Word before the office number", { max: 30 }),
    ],
  },
  {
    key: "footer",
    label: "Footer",
    description: "Footer links, legal links, copyright and statement.",
    fields: [
      {
        kind: "items",
        key: "columns",
        label: "Link columns",
        itemLabel: "Column",
        titleKey: "heading",
        fixed: true,
        min: 2,
        max: 2,
        fields: [t("heading", "Column name (for screen readers)", { max: 40 }), linkItems("links", "Links", 8, 1)],
      },
      t("connectHeading", "Contact column name (for screen readers)", { max: 40 }),
      t("whatsappLabel", "WhatsApp link label", { max: 40 }),
      linkItems("social", "Social media links", 6, 0, "Added to the contact column. They open in a new tab."),
      linkItems("legal", "Legal links", 6),
      t("copyright", "Copyright line", { max: 200 }),
      para("statement", "Statement", { max: 400 }),
      link("cta", "Footer button"),
    ],
  },
  {
    key: "actionBar",
    label: "Phone action bar",
    description: "The Call / WhatsApp / Quote bar on phones and the floating WhatsApp button on desktop.",
    fields: [
      t("call", "Call label", { max: 20 }),
      t("whatsapp", "WhatsApp label", { max: 20 }),
      t("quote", "Quote label", { max: 20 }),
      { kind: "href", key: "quoteHref", label: "Quote button goes to", required: true },
      t("desktopWhatsapp", "Desktop WhatsApp button", { max: 30 }),
    ],
  },
  {
    key: "contactLabels",
    label: "Contact detail labels",
    description: "Labels in the contact details lists on Home and Contact.",
    fields: [
      t("office", "Office phone label", { max: 60 }),
      t("mobile", "Mobile label", { max: 60 }),
      t("whatsapp", "WhatsApp label", { max: 60 }),
      t("whatsappText", "Words before the WhatsApp number", { max: 60 }),
      t("email", "Email label", { max: 60 }),
      t("address", "Address label", { max: 60 }),
      t("hours", "Hours label", { max: 60 }),
      t("afterHours", "Words before the after-hours number", { max: 80 }),
    ],
  },
  {
    key: "quoteForm",
    label: "Quote form options",
    description: "Choices in the quote form. Equipment choices come from the equipment list.",
    fields: [
      list("durationOptions", "Hire duration choices", "Choice", { max: 12 }),
      t("notSureOption", "“Not sure” equipment choice", { max: 40 }),
    ],
  },
  {
    key: "labels",
    label: "Fallback labels",
    description: "Words shown where a value has not been filled in yet.",
    fields: [
      t("specFallback", "Empty specification", { max: 60 }),
      t("credentialFallback", "Empty credential", { max: 60 }),
      t("specQuoteLink", "Tonnage row link", { max: 60 }),
      t("equipmentQuoteButton", "Equipment dialog button", { max: 60 }),
    ],
  },
];

export const equipmentFields: Field[] = [
  t("title", "Name", { max: 60 }),
  para("intro", "Short description", { max: 400 }),
  {
    kind: "image",
    key: "image",
    label: "Photo",
    requireSize: true,
    help: "A cut-out photo on a plain background works best. Without one, orange slashes show.",
  },
  {
    kind: "items",
    key: "specs",
    label: "Specifications",
    itemLabel: "Row",
    titleKey: "label",
    min: 0,
    max: 12,
    help: "Leave a value empty to show “Confirmed on enquiry”. Only list what you can confirm.",
    fields: [
      t("label", "Label", { max: 60 }),
      t("value", "Value", { required: false, max: 80 }),
      t("quote", "Quote form option", {
        required: false,
        max: 40,
        help: "Optional, e.g. “40-ton crane”. Makes this row a link that opens the quote form with this choice.",
      }),
    ],
  },
  list("uses", "Uses (shown in the pop-up)", "Use", { min: 0, max: 8 }),
  list("applications", "Applications (Equipment page)", "Application", { min: 0, max: 20 }),
  t("quote", "Quote form choice for “Get a quote”", {
    max: 40,
    help: "The equipment choice selected when someone clicks “Get a quote for this”.",
  }),
  para("note", "Small note", { required: false, max: 300 }),
];
