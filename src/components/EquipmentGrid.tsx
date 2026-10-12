import {
  type CSSProperties,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ArrowRight, Check, ChevronRight, X } from "lucide-react";
import { equipment, TBC } from "../data/site";
import { PageScrollContext } from "../lib/pageScroll";
import { btn, focusRing } from "./ui/primitives";

type EquipmentItem = (typeof equipment)[number];

// The card and the dialog share `card-<id>` and `image-<id>` layout ids, so
// Motion morphs one into the other instead of mounting a separate modal.
const EASE = [0.6, 0.05, 0.2, 1] as const;
const OPEN = { duration: 0.8, ease: EASE };
const CLOSE = { duration: 0.6, ease: EASE };
const CARD_RADIUS = 16;

// Shown for machines without a photo yet. Same proportions as a photo so the
// shared-element box scales evenly.
const PLACEHOLDER_RATIO = 1.6;

/** The machine itself. Its box always has the photo's own aspect ratio, in the
    card and in the dialog, so the layout animation never stretches it. */
function Machine({
  item,
  transition,
  className,
}: {
  item: EquipmentItem;
  transition: typeof OPEN;
  className: string;
}) {
  const ratio = item.image
    ? item.image.width / item.image.height
    : PLACEHOLDER_RATIO;
  const style = { aspectRatio: ratio, "--ratio": ratio } as CSSProperties;

  if (item.image) {
    return (
      <motion.img
        layoutId={`image-${item.id}`}
        transition={transition}
        src={item.image.src}
        alt={item.image.alt}
        width={item.image.width}
        height={item.image.height}
        draggable={false}
        style={style}
        className={`h-auto object-contain ${className}`}
      />
    );
  }

  return (
    <motion.div
      layoutId={`image-${item.id}`}
      transition={transition}
      aria-hidden
      style={style}
      className={`flex items-center justify-center gap-[5%] ${className}`}
    >
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-[62%] w-[13%] -skew-x-[20deg] bg-jch-orange" />
      ))}
    </motion.div>
  );
}

function EquipmentDialog({
  item,
  onClose,
  onQuote,
}: {
  item: EquipmentItem;
  onClose: () => void;
  onQuote: (equipment: string) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = `equipment-dialog-${item.id}`;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  // Escape closes; Tab stays inside the dialog.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("a[href], button");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Text arrives just after the card starts growing and leaves before it shrinks.
  const reveal = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay: 0.3, ease: EASE } },
    exit: { opacity: 0, y: 12, transition: { duration: 0.2 } },
  };

  return (
    <div className="fixed inset-0 z-20">
      <motion.div
        aria-hidden
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: OPEN }}
        exit={{ opacity: 0, transition: CLOSE }}
        className="absolute inset-0 bg-black/70"
      />

      <motion.div
        ref={dialogRef}
        layoutId={`card-${item.id}`}
        transition={OPEN}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ borderRadius: CARD_RADIUS }}
        className="absolute inset-2 overflow-hidden bg-jch-bg text-jch-ink md:inset-4"
      >
        <motion.div
          layoutScroll
          data-lenis-prevent
          className="grid h-full grid-cols-1 content-start overflow-y-auto md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:content-stretch"
        >
          <div className="flex items-center justify-center px-6 pt-24 pb-2 md:order-last md:items-end md:justify-end md:p-10 md:pt-28">
            <Machine
              item={item}
              transition={OPEN}
              className="w-[min(100%,calc(34svh*var(--ratio)))] md:w-[min(100%,calc((100svh-11rem)*var(--ratio)))]"
            />
          </div>

          <motion.div
            layout="position"
            {...reveal}
            className="flex flex-col justify-center gap-7 p-6 pb-10 md:p-12"
          >
            <div className="flex flex-col gap-5">
              <h2
                id={titleId}
                className="font-tight text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.025em] uppercase"
              >
                {item.title}
              </h2>
              <p className="max-w-[44ch] text-lg leading-[1.55] text-jch-muted">{item.intro}</p>
            </div>

            <dl className="max-w-[460px] border-t border-jch-line">
              {item.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4 border-b border-jch-line py-3"
                >
                  <dt className="font-tight font-semibold uppercase">{spec.label}</dt>
                  <dd className="text-right text-[15px] text-jch-muted">
                    {"quote" in spec ? (
                      <a
                        href="#quote"
                        onClick={(event) => {
                          event.preventDefault();
                          onQuote(spec.quote);
                        }}
                        className={`font-semibold text-jch-ink underline decoration-jch-orange decoration-2 underline-offset-4 hover:text-jch-orange ${focusRing}`}
                      >
                        {spec.value || "Check availability"}
                      </a>
                    ) : (
                      spec.value || TBC
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="grid max-w-[460px] grid-cols-2 gap-x-6 gap-y-2.5 max-[520px]:grid-cols-1">
              {item.uses.map((use) => (
                <li key={use} className="flex items-start gap-2.5 leading-[1.35] text-jch-muted">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-jch-orange" strokeWidth={2.5} />
                  {use}
                </li>
              ))}
            </ul>

            {item.note && <p className="max-w-[460px] text-sm leading-[1.5] text-jch-muted">{item.note}</p>}

            <a
              href="#quote"
              onClick={(event) => {
                event.preventDefault();
                onQuote(item.quote);
              }}
              className={`${btn.primary} self-start max-[640px]:self-stretch`}
            >
              Get a quote for this
              <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
            </a>
          </motion.div>
        </motion.div>

        <motion.button
          ref={closeRef}
          type="button"
          onClick={onClose}
          layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className={`absolute top-4 right-4 flex cursor-pointer items-center gap-4 rounded-lg bg-white py-1.5 pr-1.5 pl-5 font-tight text-[13px] font-semibold tracking-[0.14em] text-jch-bg uppercase md:top-6 md:right-6 ${focusRing}`}
        >
          Close
          <span className="flex size-9 items-center justify-center rounded-md bg-jch-bg text-white">
            <X aria-hidden className="size-5" strokeWidth={2.25} />
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function EquipmentGrid({
  onQuote,
}: {
  /** Called with the quote form's equipment option once the dialog has
      closed after a quote link was used, so the caller is free to scroll or
      change page. */
  onQuote: (equipment: string) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Keeps the card above its neighbours until it has finished shrinking back.
  const [raisedId, setRaisedId] = useState<string | null>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const pendingQuote = useRef<string | null>(null);
  const { setLocked } = useContext(PageScrollContext);
  const active = equipment.find((item) => item.id === activeId);

  useEffect(() => {
    if (!activeId) return;
    setLocked(true);
    return () => setLocked(false);
  }, [activeId, setLocked]);

  const open = (id: string) => {
    setRaisedId(id);
    setActiveId(id);
  };
  const close = () => setActiveId(null);

  // The quote is only handed over once the card is back in the grid, so the
  // caller's scroll never fights the closing animation.
  const handleExitComplete = () => {
    if (pendingQuote.current) {
      const value = pendingQuote.current;
      pendingQuote.current = null;
      onQuote(value);
    } else if (raisedId) {
      triggers.current.get(raisedId)?.focus({ preventScroll: true });
    }
    setRaisedId(null);
  };

  return (
    <MotionConfig reducedMotion="user">
      <ul className="grid grid-cols-3 gap-6 max-[760px]:grid-cols-1 max-[760px]:gap-10">
        {equipment.map((item) => (
          <li key={item.id} className={`relative ${raisedId === item.id ? "z-10" : ""}`}>
            <button
              ref={(node) => {
                if (node) triggers.current.set(item.id, node);
                else triggers.current.delete(item.id);
              }}
              type="button"
              onClick={() => open(item.id)}
              aria-haspopup="dialog"
              className={`group relative flex w-full cursor-pointer flex-col gap-4 text-left ${focusRing}`}
            >
              <motion.div
                layoutId={`card-${item.id}`}
                transition={CLOSE}
                style={{ borderRadius: CARD_RADIUS }}
                className="flex aspect-square w-full items-center justify-center overflow-hidden bg-jch-bg max-[760px]:aspect-[4/3]"
              >
                <Machine item={item} transition={CLOSE} className="w-[74%]" />
              </motion.div>

              <span
                aria-hidden
                className="absolute top-4 right-4 flex items-center gap-2 rounded-md bg-white py-1.5 pr-2 pl-3 font-tight text-[11px] font-semibold tracking-[0.14em] text-jch-bg uppercase opacity-0 transition-opacity duration-300 ease-jch group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
              >
                Open
                <ChevronRight className="size-3.5" strokeWidth={2.5} />
              </span>

              <span className="font-tight text-2xl leading-[1.1] font-semibold tracking-[-0.01em] text-jch-dim uppercase transition-colors duration-300 ease-jch group-hover:text-jch-bg group-focus-visible:text-jch-bg motion-reduce:transition-none">
                {item.title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {createPortal(
        <AnimatePresence onExitComplete={handleExitComplete}>
          {active && (
            <EquipmentDialog
              key={active.id}
              item={active}
              onClose={close}
              onQuote={(value) => {
                pendingQuote.current = value;
                close();
              }}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </MotionConfig>
  );
}
