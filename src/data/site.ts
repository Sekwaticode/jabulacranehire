// Single source of truth for Jabula Crane Hire company facts and page copy,
// taken from the company profile. Fields left as "" are still outstanding in
// the profile: fill them in here and the site picks them up everywhere.

/** Shown wherever a spec or credential has not been supplied yet. */
export const TBC = "Confirmed on enquiry";
export const ON_REQUEST = "Available on request";

export const site = {
  name: "Jabula Crane Hire",
  legalName: "Jabula Crane Hire (Pty) Ltd",
  tagline: "Reliable Equipment. Professional Service. Safe Lifting.",
  slogan: "Lifting your project to the next level.",

  phone: { display: "013 241 1017", href: "tel:+27132411017" },
  mobile: { display: "079 953 4581", href: "tel:+27799534581" },
  whatsappNumber: "27799534581",
  whatsappMessage: "Hi Jabula, I need a crane for…",
  email: "",

  addressLines: [
    "168 Catfish Crescent, Clearwater Eco Estate",
    "Jackaroo Park, Witbank, 1035",
  ],
  mapQuery:
    "168 Catfish Crescent, Clearwater Eco Estate, Jackaroo Park, Witbank, 1035",
  hours: "Monday – Friday: 07:00 – 17:00",
  provinces: ["Mpumalanga", "Gauteng", "Limpopo"],

  credentials: [
    { label: "Registered company name", value: "Jabula Crane Hire (Pty) Ltd" },
    { label: "Company registration number", value: "2026/337560" },
    { label: "CSD registration", value: "" },
    { label: "B-BBEE status", value: "" },
    { label: "CIDB grade", value: "" },
    { label: "COID registration", value: "" },
    { label: "Public liability insurance", value: "" },
  ],

  /** Path of the profile PDF once it is in /public, e.g. "/jabula-crane-hire-profile.pdf". */
  companyProfilePdf: "",

  /** Form endpoint that emails the sales team (Formspree, Web3Forms, etc.).
      While empty, the quote form sends the request through WhatsApp instead. */
  quoteFormEndpoint: "",

  /** GA4 measurement ID, e.g. "G-XXXXXXXXXX". Tracking stays off while empty. */
  ga4MeasurementId: "",

  /** Site photos. While empty, a branded panel is shown in each slot. */
  images: {
    hero: "",
    safety: "",
    about: "",
  },
};

export function whatsappUrl(message: string = site.whatsappMessage) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const equipmentOptions = [
  "40-ton crane",
  "50-ton crane",
  "60-ton crane",
  "Forklift",
  "Telehandler",
  "Not sure",
] as const;

export const durationOptions = [
  "One day",
  "A few days",
  "One week",
  "Several weeks",
  "One month",
  "Long-term (multi-month)",
  "Not sure",
];

export const trustFacts = [
  "Up to 60-ton capacity",
  "Operators available",
  "Daily to long-term hire",
  "Mpumalanga, Gauteng & Limpopo",
];

export const equipment = [
  {
    id: "cranes",
    title: "Mobile Cranes",
    intro:
      "40-ton to 60-ton mobile cranes for lifting, positioning and material handling.",
    specs: [
      { label: "40 Ton", value: "", quote: "40-ton crane" },
      { label: "50 Ton", value: "", quote: "50-ton crane" },
      { label: "60 Ton", value: "", quote: "60-ton crane" },
    ],
    uses: [
      "Structural steel erection",
      "Machinery positioning",
      "Plant maintenance and shutdowns",
      "Loading and offloading",
    ],
    quote: "Not sure",
    note: "Boom length and lifting charts depend on the specific machine.",
  },
  {
    id: "forklifts",
    title: "Forklifts",
    intro:
      "Forklifts for loading, unloading and moving goods and equipment around your site.",
    specs: [
      { label: "Capacity", value: "" },
      { label: "Fuel type", value: "" },
      { label: "Hire periods", value: "Daily to long-term" },
    ],
    uses: [
      "Warehouses and factories",
      "Construction sites",
      "Pallet handling",
      "Loading and unloading",
    ],
    quote: "Forklift",
    note: "",
  },
  {
    id: "telehandlers",
    title: "Telehandlers",
    intro:
      "Telescopic boom handlers that combine reach, lifting capacity and mobility.",
    specs: [
      { label: "Max capacity", value: "" },
      { label: "Max reach", value: "" },
      { label: "Max lift height", value: "" },
    ],
    uses: [
      "Elevated material placement",
      "Construction material handling",
      "Industrial maintenance",
      "Agricultural applications",
    ],
    quote: "Telehandler",
    note: "",
  },
];

export const industries = [
  {
    name: "Mining",
    text: "Lifting and handling for maintenance, construction and operations.",
  },
  {
    name: "Construction",
    text: "Cranes, forklifts and telehandlers for contractors and building projects.",
  },
  {
    name: "Engineering",
    text: "Equipment for installation, maintenance and machinery handling.",
  },
  {
    name: "Manufacturing",
    text: "Equipment movement, maintenance and installation in factories.",
  },
  {
    name: "Industrial",
    text: "Lifting for industrial construction, maintenance and installations.",
  },
  {
    name: "Infrastructure",
    text: "Reliable lifting and handling machinery for development projects.",
  },
  {
    name: "Commercial",
    text: "Equipment for developments, warehouses and shopping centres.",
  },
  {
    name: "Agriculture",
    text: "Material-handling machinery for agricultural and related projects.",
  },
];

export const reasons = [
  {
    title: "Reliable Equipment",
    text: "Machinery chosen to suit the application it is hired for.",
  },
  {
    title: "Flexible Solutions",
    text: "Hire options that fit the way your project actually runs.",
  },
  {
    title: "Wide Equipment Offering",
    text: "40-ton to 60-ton cranes, forklifts and telescopic boom handlers.",
  },
  {
    title: "Safety Focus",
    text: "Safety stays a key consideration throughout our operations.",
  },
  {
    title: "Responsive Service",
    text: "Quick responses to enquiries, quotations and equipment requirements.",
  },
  {
    title: "Competitive Solutions",
    text: "Cost-effective hire without compromising professional service.",
  },
];

export const safetyChecklist = [
  "Equipment inspections",
  "Pre-use checks before every job",
  "Lift planning where required",
  "Risk assessment",
  "Competent operators where applicable",
  "Site-specific safety requirements",
];

export const hireOptions = [
  {
    title: "Short-Term",
    suitableFor: [
      "One-day projects",
      "Emergency lifting",
      "Equipment installation",
      "Maintenance activities",
      "Loading and offloading",
    ],
  },
  {
    title: "Weekly",
    suitableFor: [
      "Construction projects",
      "Planned maintenance",
      "Short-term contracts",
      "Industrial projects",
    ],
  },
  {
    title: "Monthly / Long-Term",
    suitableFor: [
      "Major construction projects",
      "Mining operations",
      "Industrial operations",
      "Infrastructure projects",
      "Long-term contractor requirements",
    ],
  },
];

export const faqs = [
  {
    q: "Do you supply operators?",
    a: "Operator-inclusive hire can be arranged. Where we supply an operator, they are competent and appropriately qualified for the machine and the application. Tell us in your quote request whether you need one.",
  },
  {
    q: "What capacity do I need?",
    a: "It depends on the load weight, the lift radius and height, and your site conditions. Send us those details and we will recommend a 40, 50 or 60-ton crane, a forklift or a telehandler. The final selection always follows the machine's load chart.",
  },
  {
    q: "Is there a minimum hire period?",
    a: "We hire by the day, the week and the month, and on long-term contracts. A one-day hire is fine for a single lift, an installation or an offload.",
  },
  {
    q: "Do you work weekends or emergencies?",
    a: "Our office hours are Monday to Friday, 07:00 to 17:00. For urgent or after-hours lifts, call 079 953 4581 and we will tell you what we can do.",
  },
  {
    q: "How is transport charged?",
    a: "Mobilisation is quoted together with the hire and depends on where your site is. Sites outside Mpumalanga, Gauteng and Limpopo can be arranged, subject to project requirements and transport costs.",
  },
  {
    q: "What do you need from me for a quote?",
    a: "The load weight and dimensions, the site location, your dates and how long you need the machine. Drawings or site photos help. If your site has its own safety or induction requirements, tell us up front so we can plan for them.",
  },
  {
    q: "Which areas do you cover?",
    a: "Mpumalanga is our primary service area, and we also work in Gauteng and Limpopo. Ask us about sites further afield.",
  },
  {
    q: "Can you help plan the lift?",
    a: "Yes. Every lift is planned around the equipment's approved capacity, the operating conditions, the manufacturer's specifications and the legal and site requirements that apply. Call us to talk through your lift.",
  },
];

export const about = {
  intro: [
    "Jabula Crane Hire is a South African lifting and material-handling equipment hire company. We supply reliable crane and machinery solutions to businesses across the construction, mining, industrial, engineering, infrastructure and commercial sectors.",
    "Our main service is 40-ton to 60-ton mobile crane hire, supported by forklifts and telescopic boom handlers. Lifting work needs reliable equipment, competent operators and a strong commitment to safety, so we focus on practical, efficient hire that helps clients finish their projects.",
  ],
  vision:
    "To become a trusted and recognised provider of crane hire and material-handling solutions in South Africa through reliable equipment, professional service and an uncompromising commitment to safety.",
  mission:
    "To provide safe, reliable and cost-effective lifting and material-handling equipment while maintaining high standards of professionalism, service delivery and equipment availability.",
  missionPoints: [
    "Provide reliable lifting equipment for a wide range of projects.",
    "Deliver professional and responsive customer service.",
    "Support clients with practical equipment solutions.",
    "Promote safe lifting and material-handling practices.",
    "Maintain equipment to appropriate operational standards.",
    "Build long-term relationships with clients, contractors and project partners.",
  ],
  commitment: [
    "Equipment hire is more than simply supplying machinery. Our commitment is to understand your requirement, identify suitable equipment and provide dependable support throughout the hire period.",
    "We aim to be a reliable equipment-hire partner for contractors, businesses and project managers who need professional lifting and material-handling solutions.",
  ],
  quality: [
    "Reliable equipment",
    "Equipment availability",
    "Preventative maintenance",
    "Professional service",
    "Prompt communication",
    "Flexible hire arrangements",
    "Client-focused solutions",
  ],
  clients: [
    "Construction companies",
    "Mining companies",
    "Engineering contractors",
    "Mechanical contractors",
    "Electrical contractors",
    "Steel erection companies",
    "Industrial contractors",
    "Infrastructure contractors",
    "Manufacturing companies",
    "Warehouses",
    "Property developers",
    "Government contractors",
    "Maintenance contractors",
    "Shutdown contractors",
    "Plant hire companies",
    "Other equipment-hire businesses",
  ],
};
