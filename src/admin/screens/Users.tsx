import { useCallback, useEffect, useState } from "react";
import { type Profile, useStore } from "../data";
import { friendlyError, supabase } from "../supabase";
import { Card, inputClass, PageTitle, useConfirm, useToast } from "../ui";

const roleLabel: Record<Profile["role"], string> = {
  owner: "Owner (can edit and manage users)",
  editor: "Editor (can edit and publish)",
  none: "No access",
};

/** Owner-only: who can use the dashboard. */
export function Users() {
  const { profile: me } = useStore();
  const notify = useToast();
  const confirm = useConfirm();
  const [people, setPeople] = useState<Profile[] | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase!.from("profiles").select("id, email, full_name, role").order("created_at");
    if (error) notify("error", friendlyError(error));
    else setPeople(data as Profile[]);
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  if (me.role !== "owner") return <p>Only the site owner can manage users.</p>;

  const change = async (person: Profile, role: Profile["role"]) => {
    if (person.id === me.id && role !== "owner") {
      const ok = await confirm({
        title: "Change your own role?",
        message: "You'll lose the ability to manage users. Another owner would have to give it back.",
        confirmLabel: "Change my role",
        danger: true,
      });
      if (!ok) return;
    }
    const { error } = await supabase!.from("profiles").update({ role }).eq("id", person.id);
    if (error) {
      notify("error", /last owner/i.test(error.message) ? "The website needs at least one owner." : friendlyError(error));
    } else {
      notify("success", `${person.email} is now: ${roleLabel[role]}.`);
      if (person.id === me.id) window.location.reload();
    }
    await load();
  };

  return (
    <>
      <PageTitle
        title="Users"
        lead="People who can sign in to this dashboard. Nobody can sign themselves up: new people are invited from Supabase, then given a role here."
      />
      <Card>
        <ul className="divide-y divide-black/10">
          {(people ?? []).map((person) => (
            <li key={person.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-jch-bg">
                  {person.email}
                  {person.id === me.id && <span className="ml-2 text-xs text-jch-dim">(you)</span>}
                </span>
                {person.full_name && <span className="text-sm text-jch-dim">{person.full_name}</span>}
              </span>
              <label className="flex items-center gap-2 text-sm">
                <span className="sr-only">Role for {person.email}</span>
                <select
                  className={`${inputClass} w-auto`}
                  value={person.role}
                  onChange={(e) => void change(person, e.target.value as Profile["role"])}
                >
                  {(Object.keys(roleLabel) as Profile["role"][]).map((r) => (
                    <option key={r} value={r}>
                      {roleLabel[r]}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          ))}
          {people === null && <li className="p-6 text-jch-dim">Loading…</li>}
        </ul>
      </Card>
      <Card className="mt-6 p-5 text-[15px] leading-relaxed text-jch-dim">
        <h2 className="mb-2 font-semibold text-jch-bg">Adding someone</h2>
        <ol className="list-decimal pl-5">
          <li>In Supabase, open Authentication → Users and choose "Invite user". Enter their email.</li>
          <li>They click the link in the email and choose a password.</li>
          <li>They appear here with "No access". Choose Editor or Owner for them.</li>
        </ol>
      </Card>
    </>
  );
}
