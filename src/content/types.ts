// Shapes of the content the CMS manages. The public components render these;
// they never come with markup, styles or component choices.

/** A button or text link. `href` is a site path ("/contact#quote"), an
    in-page anchor ("#quote") or an https/mailto/tel/WhatsApp URL. */
export type Link = { label: string; href: string };

/** An image slot. An empty `src` shows the component's branded placeholder. */
export type Img = {
  src: string;
  alt: string;
  /** Real pixel size. Needed where the layout follows the photo's proportions. */
  width?: number;
  height?: number;
};

export type Phone = { display: string };

export type BusinessSettings = {
  name: string;
  legalName: string;
  tagline: string;
  slogan: string;
  phone: Phone;
  mobile: Phone;
  /** International format without "+", e.g. 27799534581. */
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  addressLines: string[];
  mapQuery: string;
  hours: string;
};

export type EquipmentSpec = {
  label: string;
  value: string;
  /** When set, the row links to the quote form with this option selected. */
  quote?: string;
};

export type EquipmentItem = {
  id: string;
  title: string;
  image: Img;
  intro: string;
  specs: EquipmentSpec[];
  uses: string[];
  applications: string[];
  /** Quote-form option chosen by "Get a quote for this". */
  quote: string;
  note: string;
};

export type FooterColumn = { heading: string; links: Link[] };

export type Settings = {
  business: BusinessSettings;
  credentials: {
    rows: { label: string; value: string }[];
    /** Link to the company profile PDF; empty shows "Request our company profile". */
    companyProfilePdf: string;
  };
  brand: { logo: Img; footerLogoAlt: string };
  navigation: {
    /** The slide-out menu: three columns of links. */
    columns: Link[][];
    /** Last link of the last column: "<label> <office number>". */
    callLabel: string;
  };
  footer: {
    columns: FooterColumn[];
    /** The Connect column: both phone numbers, WhatsApp, then any social links. */
    connectHeading: string;
    whatsappLabel: string;
    social: Link[];
    legal: Link[];
    copyright: string;
    statement: string;
    cta: Link;
  };
  actionBar: { call: string; whatsapp: string; quote: string; quoteHref: string; desktopWhatsapp: string };
  contactLabels: {
    office: string;
    mobile: string;
    whatsapp: string;
    whatsappText: string;
    email: string;
    address: string;
    hours: string;
    afterHours: string;
  };
  quoteForm: { durationOptions: string[]; notSureOption: string };
  labels: { specFallback: string; credentialFallback: string; specQuoteLink: string; equipmentQuoteButton: string };
};

export type PageSeo = { title: string; description: string };

export type SiteContent = {
  settings: Settings;
  pages: {
    home: { seo: PageSeo; sections: HomeSections };
    about: { seo: PageSeo; sections: AboutSections };
    equipment: { seo: PageSeo; sections: EquipmentSections };
    careers: { seo: PageSeo; sections: CareersSections };
    contact: { seo: PageSeo; sections: ContactSections };
  };
  equipment: EquipmentItem[];
};

export type PageSlug = keyof SiteContent["pages"];

type Heading = { eyebrow: string; title: string; lead: string };
export type PageHeaderContent = Heading & { image: Img };
export type CtaBannerContent = { title: string; callLabel: string; action: Link };

export type HomeSections = {
  hero: {
    title: string;
    primary: Link;
    highlights: string[];
    callLabel: string;
    image: Img;
    equipmentCard: { title: string; link: Link; image: Img };
  };
  trust: { items: string[] };
  equipment: Heading & { button: Link };
  industries: { eyebrow: string; title: string; items: { name: string; text: string; icon: string }[] };
  safety: Heading & { checklist: string[]; operatorNote: string; button: Link; photo: Img; caption: string };
  hireOptions: Heading & { suitableForLabel: string; options: { title: string; suitableFor: string[] }[]; button: Link };
  process: { title: string; periodLabel: string; steps: { title: string; content: string }[]; image: Img };
  quote: { eyebrow: string; title: string; intro: string };
};

export type AboutSections = {
  header: PageHeaderContent;
  intro: { eyebrow: string; title: string; paragraphs: string[] };
  visionMission: {
    visionLabel: string;
    vision: string;
    missionLabel: string;
    mission: string;
    pointsLabel: string;
    points: string[];
  };
  commitment: { eyebrow: string; title: string; paragraphs: string[] };
  quality: Heading & { items: string[] };
  whyChoose: { eyebrow: string; title: string; reasons: { title: string; text: string }[] };
  clients: { eyebrow: string; title: string; items: string[] };
  credentials: Heading & { downloadLabel: string; requestLabel: string; requestHref: string };
  cta: CtaBannerContent;
};

export type EquipmentSections = {
  header: PageHeaderContent;
  fleet: Heading;
  applications: { eyebrow: string; title: string; footnote: string };
  cta: CtaBannerContent;
};

export type CareersSections = {
  header: PageHeaderContent;
  intro: { eyebrow: string; title: string; paragraphs: string[] };
  teams: { title: string; items: { name: string; role: string; text: string; image: Img }[] };
  expectations: Heading & { items: string[] };
  cta: { title: string; callLabel: string; actionLabel: string; whatsappMessage: string };
};

export type ContactSections = {
  header: PageHeaderContent;
  quote: { title: string; privacyTitle: string; privacyText: string };
  reachUs: { title: string };
  faqs: Heading & { items: { q: string; a: string }[] };
};
