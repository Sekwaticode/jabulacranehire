// Small building blocks for the dashboard, in the Jabula colours.

import {
  type ButtonHTMLAttributes,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import type { Status } from "./data";
import { statusLabel } from "./data";

export const inputClass =
  "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-[15px] text-jch-bg shadow-xs outline-none transition-colors placeholder:text-black/35 focus:border-jch-orange focus:ring-2 focus:ring-jch-orange/25 aria-invalid:border-red-600";

const buttonBase =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jch-orange disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary: "bg-jch-orange text-jch-bg hover:bg-[#e46f1f]",
  dark: "bg-jch-bg text-white hover:bg-black",
  outline: "border border-black/20 bg-white text-jch-bg hover:border-jch-bg",
  ghost: "text-jch-bg hover:bg-black/5",
  danger: "border border-red-700/30 bg-white text-red-700 hover:bg-red-50",
};

export function Button({
  variant = "outline",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return <button type="button" className={`${buttonBase} ${variants[variant]} ${className}`} {...props} />;
}

const badgeTone: Record<Status, string> = {
  live: "bg-emerald-100 text-emerald-800",
  changed: "bg-amber-100 text-amber-900",
  new: "bg-sky-100 text-sky-900",
  unpublished: "bg-zinc-200 text-zinc-700",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeTone[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-black/10 bg-white shadow-xs ${className}`}>{children}</div>;
}

export function PageTitle({ title, lead, actions }: { title: string; lead?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-[70ch] flex-col gap-2">
        <h1 className="font-tight text-3xl font-semibold tracking-[-0.02em] text-jch-bg">{title}</h1>
        {lead && <p className="text-[15px] leading-relaxed text-jch-dim">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

type Toast = { id: number; tone: "success" | "error"; message: string };
const ToastContext = createContext<(tone: Toast["tone"], message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const dismiss = (id: number) => setToasts((list) => list.filter((t) => t.id !== id));
  const notify = useCallback((tone: Toast["tone"], message: string) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, tone, message }]);
    setTimeout(() => dismiss(id), tone === "error" ? 9000 : 4000);
  }, []);

  return (
    <ToastContext value={notify}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm shadow-lg ${t.tone === "error" ? "bg-red-700 text-white" : "bg-jch-bg text-white"}`}
          >
            {t.tone === "error" ? (
              <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            ) : (
              <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-jch-orange" />
            )}
            <p className="flex-1 leading-snug">{t.message}</p>
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)} className="cursor-pointer opacity-70 hover:opacity-100">
              <X aria-hidden className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-label={title}
      className={`m-auto max-h-[90svh] w-[calc(100vw-2rem)] rounded-xl bg-white p-0 text-jch-bg shadow-2xl backdrop:bg-black/50 ${wide ? "max-w-5xl" : "max-w-lg"}`}
    >
      <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
        <h2 className="font-tight text-lg font-semibold">{title}</h2>
        <button type="button" aria-label="Close" onClick={onClose} className="cursor-pointer rounded-md p-1 hover:bg-black/5">
          <X aria-hidden className="size-5" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}

type ConfirmOptions = { title: string; message: ReactNode; confirmLabel: string; danger?: boolean };
const ConfirmContext = createContext<(options: ConfirmOptions) => Promise<boolean>>(async () => false);

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );
  const finish = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };
  return (
    <ConfirmContext value={confirm}>
      {children}
      {pending && (
        <Modal title={pending.title} onClose={() => finish(false)}>
          <div className="flex flex-col gap-6">
            <div className="text-[15px] leading-relaxed text-jch-dim">{pending.message}</div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => finish(false)}>Cancel</Button>
              <Button variant={pending.danger ? "danger" : "dark"} onClick={() => finish(true)} autoFocus>
                {pending.confirmLabel}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext>
  );
}

export function formatWhen(iso: string | null) {
  if (!iso) return "never";
  const date = new Date(iso);
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}
