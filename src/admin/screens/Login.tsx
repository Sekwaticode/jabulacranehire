import { type FormEvent, type ReactNode, useState } from "react";
import { friendlyError, supabase } from "../supabase";
import { Button, inputClass } from "../ui";

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-jch-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <img src="/logo.png" alt="Jabula Crane Hire" className="mx-auto mb-8 w-40" />
        <div className="rounded-xl bg-white p-7 shadow-2xl">
          <h1 className="mb-5 font-tight text-2xl font-semibold text-jch-bg">{title}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    if (mode === "signin") {
      const { error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setMessage({
          tone: "error",
          text: /invalid login credentials/i.test(error.message) ? "That email and password don't match." : friendlyError(error),
        });
      }
    } else {
      const { error } = await supabase!.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin`,
      });
      setMessage(
        error
          ? { tone: "error", text: friendlyError(error) }
          : { tone: "info", text: "If that email has dashboard access, a reset link is on its way." },
      );
    }
    setBusy(false);
  };

  return (
    <Frame title={mode === "signin" ? "Website dashboard" : "Reset your password"}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-jch-bg">
          Email
          <input className={inputClass} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {mode === "signin" && (
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-jch-bg">
            Password
            <input
              className={inputClass}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}
        {message && (
          <p role={message.tone === "error" ? "alert" : "status"} className={`text-sm ${message.tone === "error" ? "text-red-700" : "text-jch-dim"}`}>
            {message.text}
          </p>
        )}
        <Button type="submit" variant="dark" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Send reset link"}
        </Button>
        <button
          type="button"
          className="cursor-pointer text-sm text-jch-dim underline underline-offset-4 hover:text-jch-bg"
          onClick={() => {
            setMode(mode === "signin" ? "reset" : "signin");
            setMessage(null);
          }}
        >
          {mode === "signin" ? "Forgot your password?" : "Back to sign in"}
        </button>
      </form>
    </Frame>
  );
}

/** After an invite or password-reset link: choose a password. */
export function SetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 10) return setError("Use at least 10 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    const { error } = await supabase!.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(friendlyError(error));
    else onDone();
  };

  return (
    <Frame title="Choose a password">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-jch-bg">
          New password
          <input className={inputClass} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-jch-bg">
          Type it again
          <input className={inputClass} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" variant="dark" disabled={busy}>
          {busy ? "Saving…" : "Save password"}
        </Button>
      </form>
    </Frame>
  );
}

export function NoAccess({ email }: { email: string }) {
  return (
    <Frame title="No dashboard access yet">
      <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-jch-dim">
        <p>
          You're signed in as <strong className="text-jch-bg">{email}</strong>, but this account hasn't been given access. Ask the site owner to
          give you the editor role.
        </p>
        <Button variant="dark" onClick={() => void supabase!.auth.signOut()}>
          Sign out
        </Button>
      </div>
    </Frame>
  );
}

export function NotConfigured() {
  return (
    <Frame title="Dashboard not set up">
      <p className="text-[15px] leading-relaxed text-jch-dim">
        The Supabase connection isn't configured for this deployment. Add <code>VITE_SUPABASE_URL</code> and{" "}
        <code>VITE_SUPABASE_ANON_KEY</code> in Netlify's environment variables and redeploy. See <code>docs/cms/DEPLOYMENT.md</code>.
      </p>
    </Frame>
  );
}
