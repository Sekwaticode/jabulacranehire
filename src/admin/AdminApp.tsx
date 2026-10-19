import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { FileText, Images, LayoutDashboard, LogOut, Menu as MenuIcon, Settings, Truck, Users as UsersIcon, X } from "lucide-react";
import { pageSchema } from "../content/schema";
import type { PageSlug } from "../content/types";
import { CmsDataProvider, type Profile, useStore } from "./data";
import { MediaLibrary } from "./media";
import { Link, usePath } from "./router";
import { EquipmentEditor, EquipmentList } from "./screens/EquipmentScreens";
import { Login, NoAccess, NotConfigured, SetPassword } from "./screens/Login";
import { Overview } from "./screens/Overview";
import { PageEditor } from "./screens/PageEditor";
import { SettingsScreen } from "./screens/SettingsScreen";
import { Users } from "./screens/Users";
import { friendlyError, supabase } from "./supabase";
import { ConfirmProvider, ToastProvider } from "./ui";

export default function AdminApp() {
  useEffect(() => {
    document.title = "Dashboard · Jabula Crane Hire";
    // Keep the dashboard out of search results.
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.append(meta);
    return () => meta.remove();
  }, []);

  return (
    <ToastProvider>
      <ConfirmProvider>{supabase ? <AuthGate /> : <NotConfigured />}</ConfirmProvider>
    </ToastProvider>
  );
}

// Invite and reset links land on /admin with these in the URL hash.
const arrivedToSetPassword = /type=(invite|recovery)/.test(window.location.hash);

function AuthGate() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [needsPassword, setNeedsPassword] = useState(arrivedToSetPassword);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const db = supabase!;
    void db.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = db.auth.onAuthStateChange((event, next) => {
      if (event === "PASSWORD_RECOVERY") setNeedsPassword(true);
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) {
      setProfile(undefined);
      return;
    }
    let cancelled = false;
    setProfileError(null);
    void supabase!
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setProfileError(friendlyError(error));
        setProfile((data as Profile | null) ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (session === undefined) return <Centered>Loading…</Centered>;
  if (!session) return <Login />;
  if (needsPassword) {
    return (
      <SetPassword
        onDone={() => {
          setNeedsPassword(false);
          window.history.replaceState(null, "", "/admin");
        }}
      />
    );
  }
  if (profileError) return <Centered>Couldn't check your access: {profileError}</Centered>;
  if (profile === undefined) return <Centered>Loading…</Centered>;
  if (!profile || profile.role === "none") return <NoAccess email={session.user.email ?? ""} />;

  return (
    <CmsDataProvider profile={profile}>
      <Shell />
    </CmsDataProvider>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="flex min-h-svh items-center justify-center bg-[#f4f4f2] p-8 text-center text-jch-dim">{children}</div>;
}

type NavEntry = { href: string; label: string; icon: typeof FileText; match: (path: string) => boolean };

function Shell() {
  const store = useStore();
  const path = usePath();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [path]);

  const nav: { heading?: string; entries: NavEntry[] }[] = [
    { entries: [{ href: "/admin", label: "Overview", icon: LayoutDashboard, match: (p) => p === "/admin" }] },
    {
      heading: "Pages",
      entries: Object.entries(pageSchema).map(([slug, page]) => ({
        href: `/admin/pages/${slug}`,
        label: page.label,
        icon: FileText,
        match: (p) => p === `/admin/pages/${slug}`,
      })),
    },
    {
      heading: "Content",
      entries: [
        { href: "/admin/equipment", label: "Equipment", icon: Truck, match: (p) => p.startsWith("/admin/equipment") },
        { href: "/admin/settings", label: "Business details", icon: Settings, match: (p) => p === "/admin/settings" },
        { href: "/admin/media", label: "Media library", icon: Images, match: (p) => p === "/admin/media" },
        ...(store.profile.role === "owner"
          ? [{ href: "/admin/users", label: "Users", icon: UsersIcon, match: (p: string) => p === "/admin/users" }]
          : []),
      ],
    },
  ];

  const sidebar = (
    <nav aria-label="Dashboard" className="flex h-full flex-col gap-6 overflow-y-auto bg-jch-bg px-4 py-6 text-white">
      <Link href="/admin" className="px-2">
        <img src="/logo.png" alt="Jabula Crane Hire dashboard" className="w-32" />
      </Link>
      {nav.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-1">
          {group.heading && <p className="px-2 pb-1 text-xs font-semibold tracking-[0.08em] text-white/50 uppercase">{group.heading}</p>}
          {group.entries.map((entry) => {
            const active = entry.match(path);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-2 py-2 text-[15px] font-medium ${active ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
              >
                <entry.icon aria-hidden className={`size-4 ${active ? "text-jch-orange" : ""}`} />
                {entry.label}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="mt-auto flex flex-col gap-2 border-t border-white/10 px-2 pt-4 text-sm">
        <span className="truncate text-white/60">{store.profile.email}</span>
        <a href="/" target="_blank" rel="noopener" className="text-white/75 hover:text-white">
          View website
        </a>
        <button
          type="button"
          onClick={() => void supabase!.auth.signOut()}
          className="flex cursor-pointer items-center gap-2 text-left text-white/75 hover:text-white"
        >
          <LogOut aria-hidden className="size-4" />
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-svh bg-[#f4f4f2] text-jch-bg">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-jch-bg px-4 py-3 lg:hidden">
        <img src="/logo.png" alt="Jabula Crane Hire dashboard" className="w-28" />
        <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)} className="cursor-pointer p-2 text-white">
          <MenuIcon aria-hidden className="size-6" />
        </button>
      </header>
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative h-full w-72 max-w-[85vw]">
            {sidebar}
            <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="absolute top-5 right-3 cursor-pointer p-1 text-white">
              <X aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      )}
      <main className="px-4 py-8 sm:px-8 lg:ml-64 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">
          <Screen path={path} />
        </div>
      </main>
    </div>
  );
}

function Screen({ path }: { path: string }) {
  const { profile } = useStore();
  if (path === "/admin") return <Overview />;
  const page = path.match(/^\/admin\/pages\/([a-z-]+)$/);
  if (page && page[1] in pageSchema) return <PageEditor key={page[1]} slug={page[1] as PageSlug} />;
  if (path === "/admin/equipment") return <EquipmentList />;
  const equipment = path.match(/^\/admin\/equipment\/([0-9a-f-]{36})$/);
  if (equipment) return <EquipmentEditor key={equipment[1]} id={equipment[1]} />;
  if (path === "/admin/settings") return <SettingsScreen />;
  if (path === "/admin/media") return <MediaLibrary />;
  if (path === "/admin/users" && profile.role === "owner") return <Users />;
  return (
    <p>
      That dashboard page doesn't exist.{" "}
      <Link href="/admin" className="underline">
        Go to the overview
      </Link>
    </p>
  );
}
