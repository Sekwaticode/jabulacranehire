import type { ReactNode } from "react";
import PageHeader from "../components/PageHeader";
import { container } from "../components/ui/primitives";
import { useContent } from "../content/ContentContext";
import { telHref } from "../content/links";

// POPIA privacy policy. Written in code rather than the CMS because it's a
// legal text that should only change on purpose. Business details still come
// from the dashboard, so contact info stays in step with the rest of the site.

const UPDATED = "27 October 2026";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-jch-line pt-10 max-[640px]:pt-8">
      <h2 className="font-tight text-[clamp(1.4rem,2.4vw,1.9rem)] leading-[1.1] font-semibold tracking-[-0.01em] uppercase">
        {title}
      </h2>
      <div className="flex flex-col gap-4 text-lg leading-[1.65] text-jch-muted max-[640px]:text-base [&_a]:font-semibold [&_a]:text-jch-ink [&_a]:underline [&_a]:decoration-jch-orange [&_a]:underline-offset-4 [&_strong]:text-jch-ink [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-6">
        {children}
      </div>
    </section>
  );
}

export default function Privacy() {
  const { settings } = useContent();
  const business = settings.business;
  const legalName = business.legalName || business.name;
  const email = business.email;
  const phone = business.phone.display;

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        lead={`How ${business.name} collects, uses and protects your personal information under the Protection of Personal Information Act (POPIA).`}
      />

      <div className={`${container} flex max-w-[900px] flex-col gap-12 pb-28 text-jch-ink max-[960px]:pb-20 max-[640px]:gap-10 max-[640px]:pb-16`}>
        <p className="text-sm font-medium tracking-[0.04em] text-jch-muted uppercase">Last updated: {UPDATED}</p>

        <Block title="Who we are">
          <p>
            This website is run by <strong>{legalName}</strong>, {business.addressLines.join(", ")}. We are the
            responsible party for the personal information you share with us through this website.
          </p>
        </Block>

        <Block title="What we collect">
          <ul>
            <li>
              <strong>Quote and contact requests:</strong> your name, company, phone number, email address, the
              equipment you need, your site location and any project details you give us.
            </li>
            <li>
              <strong>WhatsApp, phone and email:</strong> the details and messages you send us when you contact us
              directly.
            </li>
            <li>
              <strong>Website use:</strong> anonymous statistics such as the pages visited, the device and browser
              used, the general area (city or country) and how you arrived on the site.
            </li>
          </ul>
          <p>We don't ask for, and don't want, special personal information such as health or religious details.</p>
        </Block>

        <Block title="Why we use it">
          <ul>
            <li>To answer your enquiry and prepare a quotation.</li>
            <li>To plan, deliver and invoice the hire if you go ahead.</li>
            <li>To consider job applications sent to us.</li>
            <li>To keep the records the law requires, such as tax and safety records.</li>
            <li>To understand how the website is used, so we can improve it.</li>
          </ul>
          <p>We don't sell your information, and we don't add you to marketing lists without your consent.</p>
        </Block>

        <Block title="Who helps us">
          <p>We use a few trusted service providers. Some of them store information outside South Africa, with protections in place that POPIA requires:</p>
          <ul>
            <li><strong>Web3Forms</strong> delivers quote form submissions to our email inbox.</li>
            <li><strong>WhatsApp</strong> (Meta) carries the messages you choose to send us there.</li>
            <li><strong>Jotform</strong> runs the chat and contact widget on the site.</li>
            <li><strong>Google Analytics</strong> provides anonymous website statistics using cookies.</li>
            <li><strong>Netlify</strong> and <strong>Supabase</strong> host the website and its content.</li>
          </ul>
        </Block>

        <Block title="Cookies">
          <p>
            Google Analytics sets cookies to count visits and see which pages are useful. They don't tell us who you
            are. You can block or delete cookies in your browser settings, or use Google's{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">
              opt-out add-on
            </a>
            , and the site will still work.
          </p>
        </Block>

        <Block title="How long we keep it">
          <p>
            We keep enquiries for as long as we need them to deal with your request and any hire that follows. Records
            linked to invoices and contracts are kept for as long as tax and company law require, usually five years.
            After that we delete them.
          </p>
        </Block>

        <Block title="Your rights">
          <p>Under POPIA you can ask us to:</p>
          <ul>
            <li>confirm whether we hold personal information about you, and give you a copy;</li>
            <li>correct information that is wrong or out of date;</li>
            <li>delete information we no longer need, or stop using it;</li>
            <li>stop sending you any marketing.</li>
          </ul>
          <p>
            Email <a href={`mailto:${email}`}>{email}</a> or call <a href={telHref(phone)}>{phone}</a>. We'll reply
            within 30 days.
          </p>
          <p>
            If you're not happy with how we handled your request, you can complain to the{" "}
            <a href="https://inforegulator.org.za" target="_blank" rel="noreferrer">
              Information Regulator (South Africa)
            </a>
            .
          </p>
        </Block>

        <Block title="Keeping it safe">
          <p>
            Our website uses an encrypted connection (HTTPS), and only authorised staff can reach the information you
            send us. If a breach ever affects your information, we'll tell you and the Information Regulator as POPIA
            requires.
          </p>
        </Block>

        <Block title="Changes">
          <p>If we change this policy, we'll update it here and change the date at the top.</p>
        </Block>
      </div>
    </>
  );
}
