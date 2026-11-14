import { CalendarDays, LayoutGrid, Menu, Trophy, User, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { CLUB } from "../data/club";
import { useApp } from "../state/AppContext";
import { AuthForm } from "./AuthForm";
import { Logo, Modal, scrollToId, ThemeToggle, useGoSection, VenueSwitch } from "./ui";

const NAV: { id: string; label: string; to?: string }[] = [
  { id: "courts", label: "Корты сейчас" },
  { id: "prices", label: "Цены" },
  { id: "training", label: "Тренировки" },
  { id: "rating", label: "Рейтинг" },
  { id: "contacts", label: "Контакты" },
];

function Header() {
  const { user } = useApp();
  const go = useGoSection();
  const [menu, setMenu] = useState(false);
  const [auth, setAuth] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenu(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="wrap flex h-16 items-center gap-2.5 sm:gap-4">
        <Logo compact />
        <VenueSwitch size="sm" className="ml-auto nav:ml-2" />

        <nav aria-label="Разделы" className="ml-auto hidden items-center nav:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.id)}
              className="flex h-11 items-center whitespace-nowrap px-2.5 text-[15px] font-medium text-muted hover:text-ink"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <ThemeToggle className="hidden md:grid" />
        <Link to="/booking" className="btn btn-primary btn-sm hidden md:inline-flex">
          Забронировать
        </Link>
        {user ? (
          <Link
            to="/account"
            className="hidden h-11 items-center gap-2 px-2 text-[15px] font-medium text-ink hover:text-muted nav:flex"
          >
            <User size={18} /> Кабинет
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setAuth(true)}
            className="hidden h-11 items-center px-2 text-[15px] font-medium text-ink hover:text-muted nav:flex"
          >
            Войти
          </button>
        )}

        <button
          type="button"
          aria-label={menu ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menu}
          onClick={() => setMenu((m) => !m)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line nav:hidden"
        >
          {menu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menu && (
        <div className="swap-in border-t border-line bg-bg nav:hidden">
          <nav aria-label="Меню" className="wrap grid py-3">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setMenu(false);
                  go(n.id);
                }}
                className="flex h-12 items-center text-left text-[17px] font-medium"
              >
                {n.label}
              </button>
            ))}
            <div className="mt-3 flex items-center gap-3 border-t border-line pt-4">
              <Link to="/booking" className="btn btn-primary flex-1">
                Забронировать
              </Link>
              <ThemeToggle className="!h-[52px] !w-[52px]" />
            </div>
            <Link to="/account" className="btn btn-secondary mt-3">
              {user ? "Личный кабинет" : "Войти"}
            </Link>
          </nav>
        </div>
      )}

      {auth && (
        <Modal title="Вход в кабинет" onClose={() => setAuth(false)}>
          <AuthForm onDone={() => setAuth(false)} />
        </Modal>
      )}
    </header>
  );
}

function MobileNav() {
  const { pathname } = useLocation();
  const go = useGoSection();
  const item = "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[12px] font-medium";
  const cls = (active: boolean) => `${item} ${active ? "text-ink" : "text-muted"}`;
  return (
    <nav
      aria-label="Быстрая навигация"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <button type="button" onClick={() => go("courts")} className={cls(pathname === "/")}>
        <LayoutGrid size={20} /> Корты
      </button>
      <Link to="/booking" className={cls(pathname === "/booking")} aria-current={pathname === "/booking" ? "page" : undefined}>
        <CalendarDays size={20} /> Бронь
      </Link>
      <Link to="/rating" className={cls(pathname === "/rating")} aria-current={pathname === "/rating" ? "page" : undefined}>
        <Trophy size={20} /> Рейтинг
      </Link>
      <Link to="/account" className={cls(pathname === "/account")} aria-current={pathname === "/account" ? "page" : undefined}>
        <User size={20} /> Профиль
      </Link>
    </nav>
  );
}

function Footer() {
  const [doc, setDoc] = useState<string | null>(null);
  return (
    <footer className="border-t border-line">
      <div className="wrap flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="caption mt-2">{CLUB.legal}</p>
        </div>
        <div className="flex flex-col gap-1 md:flex-row md:gap-6">
          {["Договор-оферта", "Пользовательское соглашение"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setDoc(t)}
              className="min-h-[44px] text-left text-[15px] text-muted underline underline-offset-4 hover:text-ink"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="wrap pb-8">
        <p className="text-[13px] text-muted">Демо-версия. Цены и расписание условные.</p>
      </div>
      {doc && (
        <Modal title={doc} onClose={() => setDoc(null)}>
          <p className="text-muted">
            В демо-версии документ не опубликован. На боевом сайте здесь будет текст, согласованный с клубом.
          </p>
          <button type="button" className="btn btn-secondary mt-5 w-full" onClick={() => setDoc(null)}>
            Понятно
          </button>
        </Modal>
      )}
    </footer>
  );
}

/** Прокрутка при переходах: к секции из state или в начало страницы */
function ScrollManager() {
  const location = useLocation();
  useEffect(() => {
    const id = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (id) {
      const raf = requestAnimationFrame(() => scrollToId(id));
      return () => cancelAnimationFrame(raf);
    }
    window.scrollTo(0, 0);
  }, [location.key, location.state]);
  return null;
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded-lg focus:bg-lime focus:px-4 focus:py-3 focus:text-night"
      >
        К содержимому
      </a>
      <ScrollManager />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <div className="h-[calc(56px+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
      <MobileNav />
    </>
  );
}
