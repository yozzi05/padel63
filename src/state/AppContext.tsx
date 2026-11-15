import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { VENUES, type Venue, type VenueId } from "../data/club";
import type { Booking } from "../lib/slots";
import { load, remove, save } from "../lib/storage";
import { samaraNow, type Now } from "../lib/time";

type Theme = "dark" | "light";

interface User {
  phone: string;
}

interface AppState {
  venueId: VenueId;
  venue: Venue;
  setVenue: (id: VenueId) => void;
  theme: Theme;
  toggleTheme: () => void;
  now: Now;
  user: User | null;
  login: (phone: string) => void;
  logout: () => void;
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  cancelBooking: (id: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [venueId, setVenueId] = useState<VenueId>(() => {
    const v = load<string>("venue", "embankment");
    return v === "highway" ? "highway" : "embankment";
  });
  const [theme, setTheme] = useState<Theme>(() => (load<string>("theme", "light") === "dark" ? "dark" : "light"));
  const [now, setNow] = useState<Now>(samaraNow);
  const [user, setUser] = useState<User | null>(() => load<User | null>("user", null));
  const [bookings, setBookings] = useState<Booking[]>(() => load<Booking[]>("bookings", []));

  // Время и статусы кортов обновляются каждые 30 секунд
  useEffect(() => {
    const id = setInterval(() => setNow(samaraNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0C0D0A" : "#F4F5EE");
  }, [theme]);

  const setVenue = useCallback((id: VenueId) => {
    setVenueId(id);
    save("venue", id);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      save("theme", next);
      return next;
    });
  }, []);

  const login = useCallback((phone: string) => {
    const u = { phone };
    setUser(u);
    save("user", u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    remove("user");
  }, []);

  const addBooking = useCallback((b: Booking) => {
    setBookings((list) => {
      const next = [...list, b];
      save("bookings", next);
      return next;
    });
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setBookings((list) => {
      const next = list.map((b) => (b.id === id ? { ...b, cancelled: true } : b));
      save("bookings", next);
      return next;
    });
  }, []);

  const value = useMemo<AppState>(
    () => ({
      venueId,
      venue: VENUES[venueId],
      setVenue,
      theme,
      toggleTheme,
      now,
      user,
      login,
      logout,
      bookings,
      addBooking,
      cancelBooking,
    }),
    [venueId, setVenue, theme, toggleTheme, now, user, login, logout, bookings, addBooking, cancelBooking],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp вне AppProvider");
  return v;
}
