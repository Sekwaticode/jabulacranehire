// The site's content as it was before the CMS, gathered in one object.
// It seeds the database and is the fallback whenever Supabase is not
// configured, slow or unreachable, so the site always renders.

import {
  about,
  careers,
  durationOptions,
  equipment,
  faqs,
  hireOptions,
  industries,
  ON_REQUEST,
  reasons,
  safetyChecklist,
  site,
  TBC,
  trustFacts,
} from "../data/site";
import type { SiteContent } from "./types";

const description =
  "Jabula Crane Hire: 40-ton to 60-ton mobile cranes, forklifts and telehandlers for hire anywhere in South Africa. Call 013 241 1017 or request a quote.";

const quoteCta = { label: "Request a Quote", href: "/contact#quote" };

// Industries keep the icon they had by position in the original Home page.
const industryIcons = ["pickaxe", "hard-hat", "cog", "factory", "wrench", "route", "building", "tractor"];

export const defaultContent: SiteContent = {
  settings: {
    business: {
      name: site.name,
      legalName: site.legalName,
      tagline: site.tagline,
      slogan: site.slogan,
      phone: { display: site.phone.display },
      mobile: { display: site.mobile.display },
      whatsappNumber: site.whatsappNumber,
      whatsappMessage: site.whatsappMessage,
      email: site.email,
      addressLines: [...site.addressLines],
      mapQuery: site.mapQuery,
      hours: site.hours,
    },
    credentials: {
      rows: site.credentials.map((row) => ({ ...row })),
      companyProfilePdf: site.companyProfilePdf,
    },
    brand: {
      logo: { src: "/logo.png", alt: "Jabula Crane Hire" },
      footerLogoAlt: "JCH — Jabula Crane Hire logo",
    },
    navigation: {
      columns: [
        [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Equipment", href: "/equipment" },
        ],
        [
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
          { label: "Request a Quote", href: "/contact#quote" },
        ],
        [
          { label: "FAQs", href: "/contact#faqs" },
        ],
      ],
      callLabel: "Call",
    },
    footer: {
      columns: [
        {
          heading: "Company",
          links: [
            { label: "Home", href: "/" },
            { label: "About Us", href: "/about" },
            { label: "Equipment", href: "/equipment" },
            { label: "Careers", href: "/careers" },
          ],
        },
        {
          heading: "Resources",
          links: [
            { label: "Contact Us", href: "/contact" },
            { label: "Request a Quote", href: "/contact#quote" },
            { label: "Company Credentials", href: "/about#credentials" },
            { label: "FAQs", href: "/contact#faqs" },
          ],
        },
      ],
      connectHeading: "Connect",
      whatsappLabel: "WhatsApp",
      social: [],
      legal: [
        { label: "Privacy Notice", href: "/contact#privacy" },
        { label: "Hire Terms", href: "/#hire-options" },
        { label: "Health & Safety", href: "/#safety" },
      ],
      copyright: "Jabula Crane Hire (Pty) Ltd © 2026. Reg. 2026/337560. All rights reserved.",
      statement:
        "Reliable equipment. Professional service. Safe lifting. Cranes, forklifts and telehandlers for sites across South Africa.",
      cta: quoteCta,
    },
    actionBar: {
      call: "Call",
      whatsapp: "WhatsApp",
      quote: "Quote",
      quoteHref: "/contact#quote",
      desktopWhatsapp: "WhatsApp us",
    },
    contactLabels: {
      office: "Call the office",
      mobile: "Mobile and after hours",
      whatsapp: "WhatsApp",
      whatsappText: "Chat to us on",
      email: "Email",
      address: "Address",
      hours: "Operating hours",
      afterHours: "After hours and emergencies:",
    },
    quoteForm: { durationOptions: [...durationOptions], notSureOption: "Not sure" },
    labels: {
      specFallback: TBC,
      credentialFallback: ON_REQUEST,
      specQuoteLink: "Check availability",
      equipmentQuoteButton: "Get a quote for this",
    },
  },

  pages: {
    home: {
      seo: { title: "Crane Hire, Forklifts & Telehandlers in South Africa | Jabula Crane Hire", description },
      sections: {
        hero: {
          title: "Powering Every Lift. Moving Every Project.",
          primary: { label: "Request a Quote", href: "#quote" },
          highlights: ["Qualified Operators", "Daily to Long-Term Hire", "Anywhere in South Africa"],
          callLabel: "Call Now",
          image: { src: site.images.hero, alt: "Yellow mobile crane on an open road at dusk" },
          equipmentCard: {
            title: "Cranes, forklifts and telehandlers for every lift.",
            link: { label: "Explore Our Equipment", href: "#equipment" },
            image: { src: "/Yale_Forklift_in_Industrial_Yard.png", alt: "" },
          },
        },
        trust: { items: [...trustFacts] },
        equipment: {
          eyebrow: "Our equipment",
          title: "The right machine for the lift",
          lead: "Three equipment types cover most lifting and material-handling work on site. Open a machine to see what it does and get a quote for it.",
          button: { label: "See all equipment", href: "/equipment" },
        },
        industries: {
          eyebrow: "Industries we serve",
          title: "Built for the sites that keep the region working",
          items: industries.map((item, i) => ({ ...item, icon: industryIcons[i] })),
        },
        safety: {
          eyebrow: "Safety & operators",
          title: "Every lift is planned before it is made",
          lead: "Safety is a fundamental part of how we work. We make sure the equipment is right for the job and used the way it should be.",
          checklist: [...safetyChecklist],
          operatorNote:
            "Where we supply an operator, they are competent and appropriately qualified for the machine: they run pre-use checks, work within rated capacity, follow your site rules and report any defect or unsafe condition.",
          button: { label: "Talk to us about a lift plan", href: "/contact#quote" },
          photo: { src: site.images.safety, alt: "Operator carrying out a pre-use inspection on a mobile crane" },
          caption: "Safety first, on every lift.",
        },
        hireOptions: {
          eyebrow: "Hire options",
          title: "From a single lift to a long-term contract",
          lead: "Flexible hire built around your project. Hire terms are confirmed with your quotation.",
          suitableForLabel: "Suitable for",
          options: hireOptions.map((option) => ({ title: option.title, suitableFor: [...option.suitableFor] })),
          button: { label: "Request a Quote", href: "#quote" },
        },
        process: {
          title: "How a hire works",
          periodLabel: "First call to final lift",
          steps: [
            { title: "Tell us the lift", content: "Share the load, the site and your dates by phone, WhatsApp or the quote form" },
            { title: "We recommend the machine", content: "We match a crane, forklift or telehandler to your load and site" },
            { title: "You get a quote", content: "A quotation covering the equipment, the hire period and transport to site" },
            { title: "We confirm and mobilise", content: "Once you confirm, we schedule the machine and move it to your site" },
            { title: "Checks before the lift", content: "Pre-use inspections and your site safety requirements come first" },
            { title: "The work gets done", content: "Equipment runs within its rated capacity and your site rules" },
            { title: "We support you on site", content: "Prompt communication and dependable support for the whole hire period" },
          ],
          image: { src: "/hero.jpg", alt: "Jabula Crane Hire logo" },
        },
        quote: {
          eyebrow: "Request a quote",
          title: "Tell us about the lift",
          intro: "Send the basics and we will come back with a suitable machine and a quotation. In a hurry? Call or WhatsApp.",
        },
      },
    },

    about: {
      seo: { title: "About Us | Jabula Crane Hire", description },
      sections: {
        header: {
          eyebrow: "About us",
          title: "About Jabula Crane Hire",
          lead: "A South African lifting and material-handling equipment hire company, based in Witbank.",
          image: { src: site.images.about, alt: "" },
        },
        intro: { eyebrow: "Who we are", title: "Reliable machines, professional people", paragraphs: [...about.intro] },
        visionMission: {
          visionLabel: "Our vision",
          vision: about.vision,
          missionLabel: "Our mission",
          mission: about.mission,
          pointsLabel: "We strive to",
          points: [...about.missionPoints],
        },
        commitment: { eyebrow: "Our service commitment", title: site.slogan, paragraphs: [...about.commitment] },
        quality: {
          eyebrow: "Quality & reliability",
          title: "Equipment that is there when you need it",
          lead: "We maintain a reliable fleet and stay responsive for the whole hire period, to cut unnecessary downtime and keep your project moving.",
          items: [...about.quality],
        },
        whyChoose: {
          eyebrow: "Why choose Jabula",
          title: "Practical, dependable equipment hire",
          reasons: reasons.map((reason) => ({ ...reason })),
        },
        clients: { eyebrow: "Who we work with", title: "Clients and project partners", items: [...about.clients] },
        credentials: {
          eyebrow: "Company credentials",
          title: "For your supplier file",
          lead: "What procurement teams usually ask for when approving a new supplier.",
          downloadLabel: "Download company profile (PDF)",
          requestLabel: "Request our company profile",
          requestHref: "/contact#quote",
        },
        cta: { title: "Need a crane this week?", callLabel: "Call", action: quoteCta },
      },
    },

    equipment: {
      seo: { title: "Mobile Cranes, Forklifts & Telehandlers for Hire | Jabula Crane Hire", description },
      sections: {
        header: {
          eyebrow: "Equipment",
          title: "Cranes, Forklifts & Telehandlers for Hire",
          lead: "40-ton to 60-ton mobile cranes, supported by forklifts and telescopic boom handlers. Open a machine to see what it does and get a quote for it.",
          image: { src: "", alt: "" },
        },
        fleet: {
          eyebrow: "Our equipment",
          title: "The right machine for the lift",
          lead: "Specifications, boom lengths, lifting charts and availability depend on the specific machine and your project, and are confirmed with your quote.",
        },
        applications: {
          eyebrow: "Applications",
          title: "What each machine is used for",
          footnote:
            "Need something that is not listed? Other equipment is available on request, and we keep adding to the fleet as clients need it.",
        },
        cta: { title: "Not sure which machine you need?", callLabel: "Call", action: quoteCta },
      },
    },

    careers: {
      seo: { title: "Careers | Jabula Crane Hire", description },
      sections: {
        header: {
          eyebrow: "Careers",
          title: "Work With Jabula Crane Hire",
          lead: "Safe, reliable lifting starts with the people who operate, maintain and support the equipment.",
          image: { src: "", alt: "" },
        },
        intro: { eyebrow: "Working here", title: "People who take the lift seriously", paragraphs: [...careers.intro] },
        teams: {
          title: "The teams behind every safe lift",
          items: careers.teams.map((team) => ({
            name: team.name,
            role: team.role,
            text: team.text,
            image: { src: team.image, alt: `The ${team.name} team at Jabula Crane Hire` },
          })),
        },
        expectations: {
          eyebrow: "On site",
          title: "What we expect of everyone",
          lead: "The same standards apply on every client site, whatever the machine.",
          items: [...careers.expectations],
        },
        cta: {
          title: "Want to work with us?",
          callLabel: "Call",
          actionLabel: "WhatsApp us",
          whatsappMessage: "Hi Jabula, I'd like to ask about work opportunities.",
        },
      },
    },

    contact: {
      seo: { title: "Request a Quote or Call Us | Jabula Crane Hire", description },
      sections: {
        header: {
          eyebrow: "Contact",
          title: "Request a Quote or Call Us",
          lead: "Tell us about the lift and we will recommend the machine and send a quotation. For anything urgent, pick up the phone.",
          image: { src: "", alt: "" },
        },
        quote: {
          title: "Quote request",
          privacyTitle: "Privacy notice (POPIA).",
          privacyText:
            "We use the details you send only to respond to your enquiry and prepare your quotation. You can ask us to update or delete them at any time.",
        },
        reachUs: { title: "Reach us directly" },
        faqs: {
          eyebrow: "FAQs",
          title: "Questions we get asked",
          lead: "Can't see yours? Call us and you will get a straight answer.",
          items: faqs.map((faq) => ({ ...faq })),
        },
      },
    },
  },

  equipment: equipment.map((item) => ({
    id: item.id,
    title: item.title,
    image: { ...item.image },
    intro: item.intro,
    specs: item.specs.map((spec) => ({ ...spec })),
    uses: [...item.uses],
    applications: [...item.applications],
    quote: item.quote,
    note: item.note,
  })),
};
