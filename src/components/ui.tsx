import { Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { VENUE_IDS, VENUES } from "../data/club";
import { useApp } from "../state/AppContext";

export const reducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
}

/** Переход к секции главной с любой страницы */
export function useGoSection() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (id: string) => {
    if (pathname === "/") scrollToId(id);
    else navigate("/", { state: { scrollTo: id } });
  };
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" aria-label="Padel63, на главную" className="flex min-h-[44px] min-w-[44px] items-center gap-2.5">
      <span className="display grid h-9 w-9 shrink-0 place-items-center rounded-full bg-night text-[18px] font-extrabold text-lime ring-1 ring-line">
        63
      </span>
      <span className={`display text-[24px] font-extrabold uppercase ${compact ? "hidden min-[480px]:inline" : ""}`}>
        Padel<span className="accent-num">63</span>
      </span>
    </Link>
  );
}

/** Пилюля из двух сегментов: управляет площадкой на всём сайте */
export function VenueSwitch({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  const { venueId, setVenue } = useApp();
  const idx = VENUE_IDS.indexOf(venueId);
  return (
    <div
      role="group"
      aria-label="Площадка"
      className={`relative inline-grid h-[46px] grid-cols-2 rounded-full border border-line bg-surface ${className}`}
    >
      <span
        aria-hidden
        className="venue-thumb absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full bg-lime transition-transform duration-200 ease-out"
        style={{ transform: idx === 1 ? "translateX(100%)" : "none" }}
      />
      {VENUE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={venueId === id}
          onClick={() => setVenue(id)}
          className={`relative z-10 rounded-full font-semibold transition-colors duration-200 ${
            size === "sm" ? "px-2.5 text-[13px]" : "px-5 text-[15px]"
          } ${venueId === id ? "text-night" : "text-muted hover:text-ink"}`}
        >
          {VENUES[id].name}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useApp();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-ink hover:border-muted ${className}`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

/** Появление секции при скролле: один раз, лёгкий сдвиг и прозрачность */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (!("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);
  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function StatusDot({ state }: { state: "free" | "busy" | "closed" }) {
  if (state === "closed") return <span className="dot border border-muted" aria-hidden />;
  return <span className={`dot ${state === "free" ? "dot-free" : "dot-busy"}`} aria-hidden />;
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = ref.current?.querySelector<HTMLElement>("input, button:not([data-close])");
    first?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-in w-full max-w-[440px] rounded-t-[24px] border border-line bg-surface p-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:rounded-[24px] sm:p-7"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="display text-[28px] font-semibold leading-tight">{title}</h2>
          <button
            type="button"
            data-close
            onClick={onClose}
            aria-label="Закрыть"
            className="-mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SectionHead({ title, sub, aside }: { title: string; sub?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 md:mb-10">
      <div className="max-w-[640px]">
        <h2 className="h2">{title}</h2>
        {sub && <p className="mt-3 text-muted">{sub}</p>}
      </div>
      {aside}
    </div>
  );
}
