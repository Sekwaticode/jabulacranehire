import { settingsSchema } from "../../content/schema";
import { useStore } from "../data";
import { RecordEditor } from "../RecordEditor";
import { PageTitle } from "../ui";

export function SettingsScreen() {
  const store = useStore();
  return (
    <>
      <PageTitle
        title="Business details & settings"
        lead="Details used on every page: phone numbers, WhatsApp, address, menu and footer. Changing a phone number here updates every button and link that uses it."
      />
      <div className="flex flex-col gap-4">
        {settingsSchema.map((def) => {
          const item = store.items.find((i) => i.table === "site_settings" && i.href.endsWith(`#${def.key}`));
          if (!item) return null;
          return <RecordEditor key={item.id} item={item} anchor={def.key} title={def.label} subtitle={def.description} />;
        })}
      </div>
    </>
  );
}
