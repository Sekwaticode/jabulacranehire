import { type FormEvent, type ReactNode, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { equipmentOptions, useContent } from "../content/ContentContext";
import { telHref, whatsappUrl } from "../content/links";
import { site as developerSettings } from "../data/site";
import { track } from "../lib/analytics";
import { btn } from "./ui/primitives";

type QuoteFormProps = {
  /** Used to keep field ids unique when two forms could share a page. */
  idPrefix: string;
  equipment: string;
  onEquipmentChange: (value: string) => void;
  /** Short version for the Home page: just enough to start a conversation. */
  compact?: boolean;
};

// Field name → label, in the order they appear in the WhatsApp message.
const messageFields = [
  ["name", "Name"],
  ["company", "Company"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["equipment", "Equipment"],
  ["operator", "Operator required"],
  ["location", "Site location"],
  ["startDate", "Start date"],
  ["duration", "Hire duration"],
  ["details", "Load and lift details"],
] as const;

const inputClass =
  "w-full rounded-lg border border-jch-line bg-jch-bg px-4 py-3 text-base text-jch-ink [color-scheme:dark] transition-colors duration-200 placeholder:text-jch-muted/50 focus:border-jch-orange focus:outline-none";

function Field({
  id,
  label,
  optional,
  wide,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${wide ? "sm:col-span-2" : ""}`}>
      <label
        htmlFor={id}
        className="font-tight text-[13px] font-semibold tracking-[0.08em] text-jch-muted uppercase"
      >
        {label}
        {optional && <span className="ml-2 font-normal tracking-normal normal-case opacity-70">optional</span>}
      </label>
      {children}
    </div>
  );
}

export default function QuoteForm({
  idPrefix,
  equipment,
  onEquipmentChange,
  compact = false,
}: QuoteFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const content = useContent();
  const { business } = content.settings;
  const { durationOptions, notSureOption } = content.settings.quoteForm;
  const options = equipmentOptions(content.equipment, notSureOption);
  // The form's email endpoint is a developer setting, not CMS content.
  const endpoint = developerSettings.quoteFormEndpoint;
  const viaEmail = Boolean(endpoint);
  const phone = { display: business.phone.display, href: telHref(business.phone.display) };
  const id = (name: string) => `${idPrefix}-${name}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    if (!viaEmail) {
      const lines = messageFields
        .map(([name, label]) => [label, String(data.get(name) ?? "").trim()])
        .filter(([, value]) => value)
        .map(([label, value]) => `${label}: ${value}`);
      window.open(
        whatsappUrl(business, `Hi Jabula, I'd like a quote.\n\n${lines.join("\n")}`),
        "_blank",
        "noopener",
      );
      track("generate_lead", { method: "whatsapp", equipment });
      setStatus("sent");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Quote request failed: ${response.status}`);
      track("generate_lead", { method: "form", equipment });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-5 py-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-jch-orange text-jch-bg">
          <Check aria-hidden className="size-6" strokeWidth={2.5} />
        </span>
        <h3 className="font-tight text-3xl leading-none font-semibold tracking-[-0.02em] uppercase">
          Thank you
        </h3>
        <p className="max-w-[48ch] text-lg leading-[1.6] text-jch-muted">
          {viaEmail
            ? "Your quote request has reached our sales team and we will get back to you shortly."
            : "WhatsApp has opened with your request filled in. Press send to reach our team, and add any drawings or site photos in the chat."}{" "}
          Need an answer right now? Call{" "}
          <a href={phone.href} className="font-semibold text-jch-ink underline decoration-jch-orange underline-offset-4">
            {phone.display}
          </a>
          .
        </p>
        <button type="button" onClick={() => setStatus("idle")} className={btn.outline}>
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field id={id("name")} label="Name">
        <input id={id("name")} name="name" required autoComplete="name" className={inputClass} />
      </Field>
      {!compact && (
        <Field id={id("company")} label="Company" optional>
          <input id={id("company")} name="company" autoComplete="organization" className={inputClass} />
        </Field>
      )}
      <Field id={id("phone")} label="Phone">
        <input id={id("phone")} name="phone" type="tel" required autoComplete="tel" className={inputClass} />
      </Field>
      {!compact && (
        <Field id={id("email")} label="Email" optional>
          <input id={id("email")} name="email" type="email" autoComplete="email" className={inputClass} />
        </Field>
      )}

      <Field id={id("equipment")} label="Equipment needed">
        <select
          id={id("equipment")}
          name="equipment"
          required
          value={equipment}
          onChange={(event) => onEquipmentChange(event.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Select equipment
          </option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>

      {!compact && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-tight text-[13px] font-semibold tracking-[0.08em] text-jch-muted uppercase">
            Operator required
          </legend>
          <div className="flex gap-3">
            {["Yes", "No"].map((option) => (
              <label
                key={option}
                className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-jch-line bg-jch-bg px-4 py-3 text-base has-checked:border-jch-orange"
              >
                <input type="radio" name="operator" value={option} required className="size-4 accent-jch-orange" />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <Field id={id("location")} label="Site location (town)">
        <input id={id("location")} name="location" required placeholder="e.g. Middelburg" className={inputClass} />
      </Field>

      {!compact && (
        <>
          <Field id={id("startDate")} label="Start date" optional>
            <input id={id("startDate")} name="startDate" type="date" className={inputClass} />
          </Field>
          <Field id={id("duration")} label="Hire duration">
            <select id={id("duration")} name="duration" defaultValue="" required className={inputClass}>
              <option value="" disabled>
                Select duration
              </option>
              {durationOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
        </>
      )}

      <Field id={id("details")} label="Load weight and lift details" optional={compact} wide>
        <textarea
          id={id("details")}
          name="details"
          rows={compact ? 3 : 5}
          required={!compact}
          placeholder="What are you lifting, how heavy is it, and how high or far does it need to go?"
          className={`${inputClass} resize-y`}
        />
      </Field>

      {/* Files can only travel with the emailed form, not a WhatsApp link. */}
      {!compact && viaEmail && (
        <Field id={id("files")} label="Drawings or site photos" optional wide>
          <input
            id={id("files")}
            name="attachment"
            type="file"
            multiple
            accept="image/*,.pdf,.dwg,.dxf"
            className={`${inputClass} file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-jch-line file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-jch-ink`}
          />
        </Field>
      )}

      <div className="flex flex-col gap-4 sm:col-span-2">
        {status === "error" && (
          <p role="alert" className="rounded-lg border border-jch-orange px-4 py-3 text-base">
            Your request did not go through. Please try again, or call{" "}
            <a href={phone.href} className="font-semibold underline underline-offset-4">
              {phone.display}
            </a>
            .
          </p>
        )}
        <button type="submit" disabled={status === "sending"} className={`${btn.primary} self-start disabled:opacity-60 max-[640px]:self-stretch`}>
          {status === "sending" ? "Sending…" : "Submit quote request"}
          <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
        </button>
        {!viaEmail && (
          <p className="text-sm leading-[1.5] text-jch-muted">
            Your request opens in WhatsApp, ready to send to our team
            {compact ? "." : ". You can add drawings or site photos in the chat."}
          </p>
        )}
      </div>
    </form>
  );
}
