import { Check, LoaderCircle, Minus, Plus, Snowflake } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { Modal, reducedMotion, VenueSwitch } from "../components/ui";
import { RENTAL, VENUES } from "../data/club";
import { COURTS, seasonOpen } from "../data/courts";
import type { BusyInterval } from "../data/slots";
import {
  allTimes,
  courtPrice,
  dayBusy,
  durationOptions,
  orderTotal,
  slotState,
  STEP,
  type Booking,
  type SlotState,
} from "../lib/slots";
import { addDays, dateLabel, durLabel, fmtTime, rub } from "../lib/time";
import { useApp } from "../state/AppContext";

const TIMES = allTimes();
const HOURS = TIMES.filter((t) => t % 60 === 0);
const DAYS_AHEAD = 14;

interface Selection {
  court: number;
  start: number;
}

/* ---------- Лента дней ---------- */

function DateStrip({ today, value, onChange }: { today: string; value: string; onChange: (d: string) => void }) {
  const days = useMemo(() => Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i)), [today]);
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label="Дата">
      {days.map((d, i) => {
        const active = d === value;
        return (
          <button
            key={d}
            type="button"
            aria-pressed={active}
            aria-label={dateLabel(d, { weekday: "long", day: "numeric", month: "long" })}
            onClick={() => onChange(d)}
            className={`flex h-[64px] min-w-[58px] shrink-0 flex-col items-center justify-center rounded-[14px] border px-2 ${
              active ? "border-lime bg-lime text-night" : "border-line bg-surface text-ink hover:border-muted"
            }`}
          >
            <span className={`text-[12px] font-medium ${active ? "" : "text-muted"}`}>
              {i === 0 ? "сегодня" : i === 1 ? "завтра" : dateLabel(d, { weekday: "short" })}
            </span>
            <span className="mono text-[18px] leading-tight">{dateLabel(d, { day: "numeric" })}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Ячейка слота ---------- */

const STATE_HINT: Record<SlotState, string> = {
  free: "свободно",
  busy: "занято",
  own: "ваша бронь",
  short: "окно меньше часа",
  past: "время прошло",
};

function SlotCell({
  t,
  state,
  selected,
  onPick,
}: {
  t: number;
  state: SlotState;
  selected: boolean;
  onPick: () => void;
}) {
  const base = "mono flex h-11 w-full items-center justify-center rounded-[10px] border text-[14px]";
  if (selected) {
    return (
      <button type="button" aria-pressed="true" onClick={onPick} className={`${base} border-lime bg-lime text-night`}>
        {fmtTime(t)}
      </button>
    );
  }
  if (state === "free") {
    return (
      <button
        type="button"
        aria-pressed="false"
        aria-label={`${fmtTime(t)}, свободно`}
        onClick={onPick}
        className={`${base} border-line text-ink hover:border-[color:var(--text)]`}
      >
        {fmtTime(t)}
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled
      aria-label={`${fmtTime(t)}, ${STATE_HINT[state]}`}
      title={STATE_HINT[state]}
      className={`${base} cursor-not-allowed ${
        state === "past"
          ? "border-transparent text-muted opacity-40"
          : state === "own"
            ? "hatch border-[color:var(--text-muted)] text-ink"
            : state === "short"
              ? "border-dashed border-line text-muted opacity-60"
              : "hatch border-transparent text-muted line-through"
      }`}
    >
      {fmtTime(t)}
    </button>
  );
}

/* ---------- Сетка ---------- */

interface GridProps {
  courts: number[];
  list: BusyInterval[];
  nowMin: number | null;
  sel: Selection | null;
  dur: number;
  onPick: (court: number, start: number) => void;
}

const inSelection = (sel: Selection | null, dur: number, court: number, t: number) =>
  !!sel && sel.court === court && t >= sel.start && t < sel.start + dur;

/** Десктоп: таблица «корты × время». Строка = час, в ней два получасовых слота на корт. */
function DesktopGrid({ courts, list, nowMin, sel, dur, onPick }: GridProps) {
  const hours = HOURS.filter((h) => nowMin === null || h + 60 > nowMin);
  return (
    <div className="card hidden overflow-hidden lg:block">
      <table className="w-full border-collapse">
        <caption className="sr-only">Свободные слоты по кортам, шаг 30 минут</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="caption w-[76px] py-3 pl-5 text-left font-medium">
              Время
            </th>
            {courts.map((c) => (
              <th key={c} scope="col" className="display px-2 py-3 text-left text-[21px] font-semibold">
                Корт {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((h) => (
            <tr key={h} className="border-b border-line last:border-0">
              <th scope="row" className="mono py-1.5 pl-5 text-left text-[14px] font-medium text-muted">
                {fmtTime(h)}
              </th>
              {courts.map((c) => (
                <td key={c} className="px-2 py-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[h, h + STEP].map((t) => (
                      <SlotCell
                        key={t}
                        t={t}
                        state={slotState(list, c, t, nowMin)}
                        selected={inSelection(sel, dur, c, t)}
                        onPick={() => onPick(c, t)}
                      />
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hours.length === 0 && <p className="p-6 text-muted">На сегодня слотов больше нет. Выберите другой день.</p>}
    </div>
  );
}

/** Мобильный: вкладки кортов и список слотов выбранного корта */
function MobileGrid({
  courts,
  list,
  nowMin,
  sel,
  dur,
  onPick,
  court,
  setCourt,
}: GridProps & { court: number; setCourt: (c: number) => void }) {
  const times = TIMES.filter((t) => nowMin === null || t >= nowMin);
  return (
    <div className="lg:hidden">
      {courts.length > 1 && (
        <div role="tablist" aria-label="Корт" className="mb-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${courts.length}, 1fr)` }}>
          {courts.map((c) => {
            const free = times.filter((t) => slotState(list, c, t, nowMin) === "free").length;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={court === c}
                onClick={() => setCourt(c)}
                className={`flex h-[56px] flex-col items-center justify-center rounded-[14px] border ${
                  court === c ? "border-ink bg-ink text-bg" : "border-line bg-surface"
                }`}
              >
                <span className="text-[15px] font-semibold">Корт {c}</span>
                <span className={`text-[12px] ${court === c ? "" : "text-muted"}`}>
                  {free ? `${free} своб.` : "нет слотов"}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {times.length === 0 ? (
        <p className="card p-5 text-muted">На сегодня слотов больше нет. Выберите другой день.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2 min-[420px]:grid-cols-4">
          {times.map((t) => (
            <li key={t}>
              <SlotCell
                t={t}
                state={slotState(list, court, t, nowMin)}
                selected={inSelection(sel, dur, court, t)}
                onPick={() => onPick(court, t)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Legend() {
  const item = "flex items-center gap-2";
  const box = "inline-block h-4 w-6 rounded-[5px] border";
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-muted">
      <li className={item}>
        <span className={`${box} border-line`} aria-hidden /> Свободно
      </li>
      <li className={item}>
        <span className={`${box} border-lime bg-lime`} aria-hidden /> Выбрано
      </li>
      <li className={item}>
        <span className={`${box} hatch border-transparent`} aria-hidden /> Занято
      </li>
      <li className={item}>
        <span className={`${box} border-dashed border-line`} aria-hidden /> Окно меньше часа
      </li>
    </ul>
  );
}

/* ---------- Экран «Корт забронирован» ---------- */

function Done({ booking, onMore }: { booking: Booking; onMore: () => void }) {
  const rest = booking.total - booking.paid;
  const rows: [string, string][] = [
    ["Площадка", `${VENUES[booking.venueId].name}, ${VENUES[booking.venueId].address}`],
    ["Корт", String(booking.court)],
    ["Дата", dateLabel(booking.date, { weekday: "long", day: "numeric", month: "long" })],
    ["Время", `${fmtTime(booking.start)}–${fmtTime(booking.start + booking.dur)}`],
    ["Оплачено", rub(booking.paid)],
    ...(rest > 0 ? ([["Доплата в клубе", rub(rest)]] as [string, string][]) : []),
  ];
  return (
    <div className="wrap section">
      <div className="card mx-auto max-w-[560px] p-6 md:p-9" role="status">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-lime text-night">
          <Check size={28} aria-hidden />
        </span>
        <h1 className="h2 mt-5">Корт забронирован</h1>
        <p className="mt-3 text-muted">Бронь сохранена в личном кабинете. Слот занят в сетке и на табло.</p>
        <dl className="mt-6 divide-y divide-[color:var(--line)] border-y border-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-6 py-3">
              <dt className="caption shrink-0">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to="/account" className="btn btn-primary flex-1">
            Мои брони
          </Link>
          <button type="button" className="btn btn-secondary flex-1" onClick={onMore}>
            Забронировать ещё
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Страница ---------- */

export default function BookingPage() {
  const { venue, venueId, setVenue, now, bookings, addBooking, user } = useApp();
  const location = useLocation();
  const init = location.state as { court?: number; start?: number | null } | null;
  const courts = COURTS[venueId];

  const [date, setDate] = useState(now.date);
  const [tabCourt, setTabCourt] = useState(init?.court && courts.includes(init.court) ? init.court : courts[0]);
  const [sel, setSel] = useState<Selection | null>(null);
  const [dur, setDur] = useState(90);
  const [rackets, setRackets] = useState(0);
  const [balls, setBalls] = useState(false);
  const [pct, setPct] = useState<50 | 100>(50);
  const [authOpen, setAuthOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  const list = useMemo(() => dayBusy(venueId, date, bookings), [venueId, date, bookings]);
  const nowMin = date === now.date ? now.min : null;
  const closedSeason = venue.outdoor && !seasonOpen;

  // Смена площадки или дня сбрасывает выбор
  const prevKey = useRef(venueId + date);
  useEffect(() => {
    if (prevKey.current === venueId + date) return;
    prevKey.current = venueId + date;
    setSel(null);
    setTabCourt((c) => (courts.includes(c) ? c : courts[0]));
  }, [venueId, date]); // eslint-disable-line react-hooks/exhaustive-deps

  // Переход с табло «Корты сейчас»: ближайший свободный слот корта уже выбран
  useEffect(() => {
    const c = init?.court;
    const s = init?.start;
    if (!c || s == null || !courts.includes(c) || slotState(list, c, s, nowMin) !== "free") return;
    const opts = durationOptions(list, c, s);
    const best = opts.find((o) => o.dur === 90 && o.ok) ?? opts.find((o) => o.ok);
    if (!best) return;
    setDur(best.dur);
    setSel({ court: c, start: s });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Если дата ушла в прошлое (страница открыта через полночь), вернуть на сегодня
  useEffect(() => {
    if (date < now.date) setDate(now.date);
  }, [date, now.date]);

  // Выбранный слот успел начаться — снять выбор
  useEffect(() => {
    if (sel && nowMin !== null && sel.start < nowMin) setSel(null);
  }, [sel, nowMin]);

  const options = sel ? durationOptions(list, sel.court, sel.start) : [];

  const pick = (court: number, start: number) => {
    if (sel && sel.court === court && sel.start === start) {
      setSel(null);
      return;
    }
    const opts = durationOptions(list, court, start);
    const keep = opts.find((o) => o.dur === dur && o.ok);
    const best = [...opts].reverse().find((o) => o.ok && o.dur <= dur) ?? opts.find((o) => o.ok);
    if (!keep && best) setDur(best.dur);
    setSel({ court, start });
    setTabCourt(court);
    // На телефоне панель с итогом ниже списка слотов: подводим к ней
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" }),
      );
    }
  };

  const total = sel ? orderTotal(dur, rackets, balls) : 0;
  const payNow = Math.round((total * pct) / 100);

  const pay = (phone: string) => {
    if (!sel) return;
    setPaying(true);
    const order: Booking = {
      id: `b-${Date.now().toString(36)}`,
      venueId,
      court: sel.court,
      date,
      start: sel.start,
      dur,
      rackets,
      balls,
      total,
      paid: payNow,
      phone,
      createdAt: Date.now(),
    };
    // Имитация оплаты
    setTimeout(() => {
      addBooking(order);
      setPaying(false);
      setSel(null);
      setDone(order);
      window.scrollTo(0, 0);
    }, 900);
  };

  const checkout = () => {
    if (!sel || paying) return;
    if (!user) setAuthOpen(true);
    else pay(user.phone);
  };

  if (done) {
    return (
      <Done
        booking={done}
        onMore={() => {
          setDone(null);
          setRackets(0);
          setBalls(false);
        }}
      />
    );
  }

  const payLabel = paying ? "Оплата…" : `Оплатить ${rub(payNow)}`;

  return (
    <div className="wrap pb-16 pt-8 md:pt-12">
      <h1 className="h2">Бронирование корта</h1>
      <p className="mt-3 max-w-[640px] text-muted">
        Выберите площадку, день и свободный слот. Вход по телефону понадобится только перед оплатой.
      </p>

      <div className="mt-7 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid min-w-0 gap-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <VenueSwitch />
            <p className="caption">
              {venue.courtType} · {venue.address}
            </p>
          </div>

          <DateStrip today={now.date} value={date} onChange={setDate} />

          {closedSeason ? (
            <div className="card flex flex-col items-start gap-4 p-6">
              <Snowflake size={28} aria-hidden />
              <h2 className="display text-[31px] font-semibold">Закрыто до весны</h2>
              <p className="text-muted">Открытые корты работают в тёплый сезон. Зимой играем под крышей на Шоссейной.</p>
              <button type="button" className="btn btn-primary" onClick={() => setVenue("highway")}>
                Перейти на Шоссейную
              </button>
            </div>
          ) : (
            <div key={venueId + date} className="swap-in grid gap-4">
              <h2 className="text-[17px] font-semibold">
                {dateLabel(date, { weekday: "long", day: "numeric", month: "long" })}
                <span className="font-normal text-muted"> · шаг 30 минут</span>
              </h2>
              <DesktopGrid courts={courts} list={list} nowMin={nowMin} sel={sel} dur={dur} onPick={pick} />
              <MobileGrid
                courts={courts}
                list={list}
                nowMin={nowMin}
                sel={sel}
                dur={dur}
                onPick={pick}
                court={tabCourt}
                setCourt={setTabCourt}
              />
              <Legend />
            </div>
          )}
        </div>

        {/* Панель с итогом: липкая на десктопе, под сеткой на телефоне */}
        <aside ref={panelRef} className="card scroll-mt-20 p-5 md:p-6 lg:sticky lg:top-[88px]" aria-label="Ваша бронь">
          {!sel ? (
            <>
              <h2 className="display text-[25px] font-semibold">Ваша бронь</h2>
              <p className="mt-3 text-muted">Нажмите на свободный слот в сетке. Длительность и допы выберете здесь.</p>
              <p className="caption mt-4">
                1 час {rub(courtPrice(60))} · 1,5 часа {rub(courtPrice(90))} · 2 часа {rub(courtPrice(120))}
              </p>
            </>
          ) : (
            <div className="grid gap-5">
              <div>
                <p className="caption">
                  {venue.name} · корт {sel.court}
                </p>
                <p className="mt-1 text-[22px] font-semibold leading-tight">
                  <span className="mono">
                    {fmtTime(sel.start)}–{fmtTime(sel.start + dur)}
                  </span>
                </p>
                <p className="mt-1 text-[15px] text-muted">
                  {dateLabel(date, { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>

              <fieldset>
                <legend className="caption mb-2">Длительность</legend>
                <div className="grid grid-cols-3 gap-2">
                  {options.map((o) => (
                    <button
                      key={o.dur}
                      type="button"
                      disabled={!o.ok}
                      aria-pressed={dur === o.dur}
                      onClick={() => setDur(o.dur)}
                      className={`h-12 rounded-[12px] border text-[15px] font-semibold ${
                        dur === o.dur && o.ok
                          ? "border-lime bg-lime text-night"
                          : o.ok
                            ? "border-line hover:border-muted"
                            : "hatch cursor-not-allowed border-transparent text-muted"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {options
                  .filter((o) => !o.ok)
                  .map((o) => (
                    <p key={o.dur} className="caption mt-2">
                      {o.label} недоступно: {o.reason}.
                    </p>
                  ))}
              </fieldset>

              <fieldset className="grid gap-3">
                <legend className="caption mb-2">Прокат</legend>
                <div className="flex items-center justify-between gap-3">
                  <span>
                    Ракетки <span className="caption">· {rub(RENTAL.racket)} за шт.</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Убрать ракетку"
                      disabled={rackets === 0}
                      onClick={() => setRackets((n) => Math.max(0, n - 1))}
                      className="grid h-11 w-11 place-items-center rounded-full border border-line disabled:opacity-40"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="mono w-7 text-center" aria-live="polite" aria-label={`Ракеток: ${rackets}`}>
                      {rackets}
                    </span>
                    <button
                      type="button"
                      aria-label="Добавить ракетку"
                      disabled={rackets === 4}
                      onClick={() => setRackets((n) => Math.min(4, n + 1))}
                      className="grid h-11 w-11 place-items-center rounded-full border border-line disabled:opacity-40"
                    >
                      <Plus size={18} />
                    </button>
                  </span>
                </div>
                <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3">
                  <span>
                    {RENTAL.ballsLabel} <span className="caption">· {rub(RENTAL.balls)}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={balls}
                    onChange={(e) => setBalls(e.target.checked)}
                    className="h-6 w-6 shrink-0 accent-[#C9F51A]"
                  />
                </label>
              </fieldset>

              <fieldset>
                <legend className="caption mb-2">Предоплата</legend>
                <div className="grid grid-cols-2 gap-2">
                  {([50, 100] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={pct === p}
                      onClick={() => setPct(p)}
                      className={`flex h-[56px] flex-col items-center justify-center rounded-[12px] border ${
                        pct === p ? "border-ink bg-ink text-bg" : "border-line hover:border-muted"
                      }`}
                    >
                      <span className="text-[15px] font-semibold">{p}%</span>
                      <span className="mono text-[13px]">{rub((total * p) / 100)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <dl className="grid gap-2 border-t border-line pt-4 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Корт, {durLabel(dur)}</dt>
                  <dd className="mono">{rub(courtPrice(dur))}</dd>
                </div>
                {rackets > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Ракетки × {rackets}</dt>
                    <dd className="mono">{rub(rackets * RENTAL.racket)}</dd>
                  </div>
                )}
                {balls && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Мячи</dt>
                    <dd className="mono">{rub(RENTAL.balls)}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-4 pt-1">
                  <dt className="font-semibold">Итого</dt>
                  <dd className="display text-[34px] font-extrabold">{rub(total)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">≈ на игрока</dt>
                  <dd className="mono">{rub(total / 4)}</dd>
                </div>
                {pct === 50 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Доплата в клубе</dt>
                    <dd className="mono">{rub(total - payNow)}</dd>
                  </div>
                )}
              </dl>

              <button type="button" className="btn btn-primary hidden w-full lg:inline-flex" onClick={checkout} disabled={paying}>
                {paying && <LoaderCircle size={18} className="spin" aria-hidden />}
                {payLabel}
              </button>
              <p className="caption -mt-2 text-center">Демо: деньги не списываются.</p>
            </div>
          )}
        </aside>
      </div>

      {/* Мобильная нижняя панель с итогом: перекрывает навигацию, пока выбран слот */}
      {sel && (
        <div className="sheet-in fixed inset-x-0 bottom-0 z-[45] border-t border-line bg-surface px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px]">
                <span className="mono">
                  {fmtTime(sel.start)}–{fmtTime(sel.start + dur)}
                </span>{" "}
                · корт {sel.court}
              </p>
              <p className="caption truncate">Итого {rub(total)}</p>
            </div>
            <button type="button" className="btn btn-primary shrink-0 !px-4" onClick={checkout} disabled={paying}>
              {paying && <LoaderCircle size={18} className="spin" aria-hidden />}
              {payLabel}
            </button>
          </div>
        </div>
      )}

      {authOpen && (
        <Modal title="Вход перед оплатой" onClose={() => setAuthOpen(false)}>
          <AuthFormForPay
            onPhone={(phone) => {
              setAuthOpen(false);
              pay(phone);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

/** После входа сразу продолжаем оплату: телефон берём из обновлённого состояния */
function AuthFormForPay({ onPhone }: { onPhone: (phone: string) => void }) {
  const { user } = useApp();
  const fired = useRef(false);
  useEffect(() => {
    if (user && !fired.current) {
      fired.current = true;
      onPhone(user.phone);
    }
  }, [user, onPhone]);
  return <AuthForm submitLabel="Войти и оплатить" />;
}
