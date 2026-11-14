import { CLUB } from "../data/club";

export interface Now {
  /** Дата в Самаре, YYYY-MM-DD */
  date: string;
  /** Минуты от полуночи по Самаре */
  min: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 420 → «07:00», 1440 → «00:00» */
export const fmtTime = (m: number) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;

/** Текущие дата и время в часовом поясе клуба (Europe/Samara, UTC+4) */
export function samaraNow(): Now {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLUB.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const g = (t: string) => parts.find((x) => x.type === t)?.value ?? "0";
  return { date: `${g("year")}-${g("month")}-${g("day")}`, min: Number(g("hour")) * 60 + Number(g("minute")) };
}

export function addDays(date: string, n: number) {
  const x = new Date(date + "T12:00:00Z");
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
}

export function dateLabel(
  date: string,
  opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "long" },
) {
  return new Date(date + "T12:00:00Z").toLocaleDateString("ru-RU", { ...opts, timeZone: "UTC" });
}

/** «14 мин», «1 ч 20 мин» */
export function minsText(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h} ч ${m} мин`;
  if (h) return `${h} ч`;
  return `${Math.max(m, 1)} мин`;
}

const NBSP = " ";

/** 3000 → «3 000 ₽» с неразрывными пробелами */
export const rub = (n: number) =>
  Math.round(n).toLocaleString("ru-RU").replace(/\s/g, NBSP) + NBSP + "₽";

export function durLabel(dur: number) {
  if (dur === 60) return "1 час";
  if (dur === 90) return "1,5 часа";
  if (dur === 120) return "2 часа";
  return minsText(dur);
}

/** Приводит ввод к виду 7XXXXXXXXXX или возвращает null */
export function normPhone(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.length === 11 && d[0] === "8") d = "7" + d.slice(1);
  if (d.length === 10) d = "7" + d;
  return d.length === 11 && d[0] === "7" ? d : null;
}

export function prettyPhone(p: string) {
  return `+7 (${p.slice(1, 4)}) ${p.slice(4, 7)}-${p.slice(7, 9)}-${p.slice(9, 11)}`;
}
