import { CLUB, type VenueId } from "./club";
import { COURTS } from "./courts";

// ДЕМО-ДАННЫЕ, уточнить у клуба
// Занятость кортов генерируется псевдослучайно от даты: одна и та же дата всегда
// даёт одно и то же расписание, поэтому при перезагрузке ничего не «прыгает».
// При подключении API замените demoBusy() на запрос занятых интервалов.

export const SLOT_STEP = 30;

export interface BusyInterval {
  id: string;
  venueId: VenueId;
  court: number;
  date: string;
  /** Начало в минутах от полуночи */
  start: number;
  /** Длительность в минутах */
  dur: number;
  /** Бронь текущего посетителя (из localStorage) */
  own?: boolean;
}

function rng(seed: string) {
  let h = 2166136261;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

const DURATIONS = [60, 90, 90, 120];
const EVENING_FROM = 18 * 60;
const EVENING_TO = 22 * 60;

const cache = new Map<string, BusyInterval[]>();

export function demoBusy(venueId: VenueId, date: string): BusyInterval[] {
  const key = venueId + ":" + date;
  const hit = cache.get(key);
  if (hit) return hit;

  const out: BusyInterval[] = [];
  for (const court of COURTS[venueId]) {
    const r = rng(`${venueId}:${date}:${court}`);
    let t = CLUB.openMin + SLOT_STEP * Math.floor(r() * 4);
    while (t < CLUB.closeMin) {
      const evening = t >= EVENING_FROM && t < EVENING_TO;
      const dur = DURATIONS[Math.floor(r() * DURATIONS.length)];
      // Вечером 18:00–22:00 корты заняты плотнее
      if (t + dur <= CLUB.closeMin && r() < (evening ? 0.85 : 0.38)) {
        out.push({ id: `demo-${venueId}-${date}-${court}-${t}`, venueId, court, date, start: t, dur });
        t += dur;
        if (evening && r() < 0.6) continue;
      }
      t += SLOT_STEP * (1 + Math.floor(r() * 3));
    }
  }
  cache.set(key, out);
  return out;
}
