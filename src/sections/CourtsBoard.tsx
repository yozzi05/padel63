import { ArrowRight, CloudSun, Snowflake, Warehouse } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Reveal, SectionHead, StatusDot, VenueSwitch } from "../components/ui";
import { WEATHER_DEMO } from "../data/club";
import { COURTS, seasonOpen } from "../data/courts";
import type { BusyInterval } from "../data/slots";
import { CLOSE, courtStatus, dayBusy, OPEN, type CourtStatus } from "../lib/slots";
import { fmtTime } from "../lib/time";
import { useApp } from "../state/AppContext";

const LABEL: Record<CourtStatus["state"], string> = {
  free: "Свободен",
  busy: "Идёт игра",
  closed: "Закрыто",
};

/** Полоса дня 07:00–00:00: занятые отрезки и отметка «сейчас» */
function DayLine({ list, court, now }: { list: BusyInterval[]; court: number; now: number }) {
  const span = CLOSE - OPEN;
  const pct = (m: number) => ((m - OPEN) / span) * 100;
  return (
    <div aria-hidden>
      <div className="relative h-3 overflow-hidden rounded-full border border-line bg-bg">
        {list
          .filter((b) => b.court === court)
          .map((b) => (
            <span
              key={b.id}
              className={`absolute inset-y-0 ${b.own ? "bg-lime" : ""}`}
              style={{
                left: `${pct(b.start)}%`,
                width: `${(b.dur / span) * 100}%`,
                background: b.own ? undefined : "var(--busy)",
                opacity: b.own ? 1 : 0.75,
              }}
            />
          ))}
        {now >= OPEN && now < CLOSE && (
          <span className="absolute inset-y-0 w-0.5 bg-ink" style={{ left: `${pct(now)}%` }} />
        )}
      </div>
      <div className="mono mt-1.5 flex justify-between text-[11px] text-muted">
        <span>07:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>00:00</span>
      </div>
    </div>
  );
}

function CourtRow({ court, list, now }: { court: number; list: BusyInterval[]; now: number }) {
  const navigate = useNavigate();
  const s = courtStatus(list, court, now);
  const color = s.state === "free" ? "var(--accent-ink)" : s.state === "busy" ? "var(--busy-ink)" : "var(--text-muted)";
  return (
    <article className="card grid gap-x-8 gap-y-5 p-5 md:grid-cols-[150px_minmax(0,1fr)_minmax(0,1.25fr)_210px] md:items-center md:p-6">
      <div className="flex items-baseline justify-between gap-3 md:block">
        <p className="caption md:mb-1">Корт</p>
        <p className="display text-[56px] font-extrabold leading-none md:text-[73px]">{String(court).padStart(2, "0")}</p>
      </div>

      <div>
        <p className="flex items-center gap-2.5 text-[17px] font-semibold" style={{ color }}>
          <StatusDot state={s.state} />
          {LABEL[s.state]}
        </p>
        <p className="mono mt-1.5 text-[15px] text-ink">{s.text}</p>
        {s.state === "busy" && (
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-label="Текущая игра"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(s.progress * 100)}
          >
            <div
              className="h-full origin-left rounded-full"
              style={{ background: "var(--busy)", transform: `scaleX(${s.progress})` }}
            />
          </div>
        )}
      </div>

      <DayLine list={list} court={court} now={now} />

      <div className="flex items-center justify-between gap-4 md:block">
        <p className="caption md:mb-3">
          Ближайший слот:{" "}
          <span className="mono whitespace-nowrap text-ink">
            {s.nextFree !== null ? fmtTime(s.nextFree) : "завтра"}
          </span>
        </p>
        <button
          type="button"
          className={`btn btn-sm md:w-full ${s.state === "free" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => navigate("/booking", { state: { court, start: s.nextFree } })}
        >
          Выбрать время
        </button>
      </div>
    </article>
  );
}

export function CourtsBoard() {
  const { venue, venueId, setVenue, now, bookings } = useApp();
  const list = useMemo(() => dayBusy(venueId, now.date, bookings), [venueId, now.date, bookings]);
  const closedSeason = venue.outdoor && !seasonOpen;

  return (
    <section id="courts" className="section">
      <div className="wrap">
        <Reveal>
          <SectionHead
            title="Корты сейчас"
            sub="Статус обновляется каждые 30 секунд. На полосе видно, когда корт занят сегодня."
            aside={<VenueSwitch />}
          />
        </Reveal>

        <div key={venueId} className="swap-in grid gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-1 text-[15px]">
            <span className="inline-flex items-center gap-2 font-medium">
              {venue.outdoor ? <CloudSun size={18} aria-hidden /> : <Warehouse size={18} aria-hidden />}
              {venue.courtType}
            </span>
            {venue.outdoor ? (
              <span className="text-muted">
                Сейчас <span className="mono text-ink">{WEATHER_DEMO.temp}</span>, {WEATHER_DEMO.text}
              </span>
            ) : (
              <span className="text-muted">Под крышей: игра в любую погоду</span>
            )}
            <span className="text-muted">{venue.address}</span>
          </div>

          {closedSeason ? (
            <div className="card flex flex-col items-start gap-4 p-6 md:p-8">
              <Snowflake size={28} aria-hidden />
              <h3 className="display text-[31px] font-semibold">Закрыто до весны</h3>
              <p className="max-w-[520px] text-muted">
                Открытые корты на набережной работают в тёплый сезон. Зимой играем под крышей на Шоссейной.
              </p>
              <button type="button" className="btn btn-primary" onClick={() => setVenue("highway")}>
                Смотреть корт на Шоссейной
              </button>
            </div>
          ) : (
            COURTS[venueId].map((c) => <CourtRow key={c} court={c} list={list} now={now.min} />)
          )}

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-2">
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-muted">
              <li className="flex items-center gap-2">
                <StatusDot state="free" /> Свободен
              </li>
              <li className="flex items-center gap-2">
                <StatusDot state="busy" /> Идёт игра или занято
              </li>
            </ul>
            <Link
              to="/booking"
              className="inline-flex min-h-[44px] items-center gap-2 font-semibold underline underline-offset-4"
            >
              Расписание на 2 недели <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
