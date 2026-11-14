// Логика статусов кортов и слотов. Не зависит от React и от источника данных:
// на вход получает список занятых интервалов за день.
import { CLUB, PRICES, RENTAL, type VenueId } from "../data/club";
import { demoBusy, SLOT_STEP, type BusyInterval } from "../data/slots";
import { fmtTime, minsText } from "./time";

export const OPEN = CLUB.openMin;
export const CLOSE = CLUB.closeMin;
export const STEP = SLOT_STEP;
export const MIN_DUR = 60;

export interface Booking {
  id: string;
  venueId: VenueId;
  court: number;
  date: string;
  start: number;
  dur: number;
  rackets: number;
  balls: boolean;
  total: number;
  paid: number;
  phone: string;
  createdAt: number;
  cancelled?: boolean;
}

/** Все занятые интервалы площадки за день: демо-занятость плюс брони посетителя */
export function dayBusy(venueId: VenueId, date: string, bookings: Booking[]): BusyInterval[] {
  const own = bookings
    .filter((b) => !b.cancelled && b.venueId === venueId && b.date === date)
    .map<BusyInterval>((b) => ({ id: b.id, venueId, court: b.court, date, start: b.start, dur: b.dur, own: true }));
  return [...demoBusy(venueId, date), ...own];
}

export const findOverlap = (list: BusyInterval[], court: number, start: number, dur: number) =>
  list.find((b) => b.court === court && b.start < start + dur && start < b.start + b.dur);

/** Ближайшее начало, с которого корт свободен минимум час */
export function nextFreeStart(list: BusyInterval[], court: number, from: number): number | null {
  let t = Math.max(OPEN, Math.ceil(from / STEP) * STEP);
  for (; t + MIN_DUR <= CLOSE; t += STEP) {
    if (!findOverlap(list, court, t, MIN_DUR)) return t;
  }
  return null;
}

export type CourtStatus =
  | { state: "closed"; text: string; nextFree: number | null }
  | { state: "busy"; text: string; freeAt: number; progress: number; nextFree: number | null }
  | { state: "free"; text: string; until: number; nextFree: number | null };

export function courtStatus(list: BusyInterval[], court: number, now: number): CourtStatus {
  if (now < OPEN) {
    return { state: "closed", text: `Откроется в ${fmtTime(OPEN)}`, nextFree: nextFreeStart(list, court, OPEN) };
  }
  const mine = list.filter((b) => b.court === court).sort((a, b) => a.start - b.start);
  const cur = mine.find((b) => b.start <= now && now < b.start + b.dur);
  if (cur) {
    // Игры, идущие подряд без перерыва, считаем одним занятым отрезком
    let end = cur.start + cur.dur;
    for (let next; (next = mine.find((b) => b.start === end)); ) end = next.start + next.dur;
    return {
      state: "busy",
      freeAt: end,
      progress: Math.min(1, (now - cur.start) / cur.dur),
      text: end >= CLOSE ? "Занят до закрытия" : `Освободится через ${minsText(end - now)}`,
      nextFree: nextFreeStart(list, court, end),
    };
  }
  const next = mine.find((b) => b.start > now);
  const until = next ? next.start : CLOSE;
  return {
    state: "free",
    until,
    text: next ? `Свободен до ${fmtTime(until)}` : "Свободен до закрытия",
    nextFree: nextFreeStart(list, court, now),
  };
}

export type SlotState = "free" | "busy" | "own" | "short" | "past";

/** Состояние получасового слота. nowMin передаётся только для сегодняшней даты. */
export function slotState(list: BusyInterval[], court: number, t: number, nowMin: number | null): SlotState {
  if (nowMin !== null && t < nowMin) return "past";
  const hit = findOverlap(list, court, t, STEP);
  if (hit) return hit.own ? "own" : "busy";
  // Свободное окно короче часа забронировать нельзя
  if (t + MIN_DUR > CLOSE || findOverlap(list, court, t, MIN_DUR)) return "short";
  return "free";
}

export interface DurationOption {
  dur: number;
  label: string;
  price: number;
  ok: boolean;
  /** Почему длительность недоступна */
  reason?: string;
}

export function durationOptions(list: BusyInterval[], court: number, start: number): DurationOption[] {
  return PRICES.map((p) => {
    if (start + p.dur > CLOSE) {
      return { ...p, ok: false, reason: `клуб закрывается в ${fmtTime(CLOSE)}` };
    }
    const hit = findOverlap(list, court, start, p.dur);
    if (hit) return { ...p, ok: false, reason: `с ${fmtTime(hit.start)} корт занят` };
    return { ...p, ok: true };
  });
}

export const allTimes = (): number[] => {
  const out: number[] = [];
  for (let t = OPEN; t < CLOSE; t += STEP) out.push(t);
  return out;
};

export function courtPrice(dur: number) {
  return PRICES.find((p) => p.dur === dur)?.price ?? 0;
}

export function orderTotal(dur: number, rackets: number, balls: boolean) {
  return courtPrice(dur) + rackets * RENTAL.racket + (balls ? RENTAL.balls : 0);
}

/** Бронь ещё не закончилась */
export function isUpcoming(b: Booking, today: string, nowMin: number) {
  return b.date > today || (b.date === today && b.start + b.dur > nowMin);
}
