import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { Modal } from "../components/ui";
import { VENUES } from "../data/club";
import { LEAGUES, type RatingRow } from "../data/rating";
import { isUpcoming, type Booking } from "../lib/slots";
import { dateLabel, fmtTime, prettyPhone, rub } from "../lib/time";
import { useApp } from "../state/AppContext";

function BookingCard({ b, upcoming, onCancel }: { b: Booking; upcoming: boolean; onCancel?: () => void }) {
  const v = VENUES[b.venueId];
  const extras = [b.rackets ? `ракетки × ${b.rackets}` : "", b.balls ? "мячи" : ""].filter(Boolean).join(", ");
  return (
    <li className={`card p-5 md:p-6 ${upcoming ? "" : "opacity-70"}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="caption">
            {v.name} · корт {b.court}
            {b.cancelled && " · отменена"}
          </p>
          <p className="mt-1 text-[19px] font-semibold">
            {dateLabel(b.date, { weekday: "short", day: "numeric", month: "long" })},{" "}
            <span className="mono whitespace-nowrap">
              {fmtTime(b.start)}–{fmtTime(b.start + b.dur)}
            </span>
          </p>
          <p className="mt-1 text-[15px] text-muted">
            {v.address}
            {extras && ` · ${extras}`}
          </p>
        </div>
        <div className="text-right">
          <p className="mono text-[17px]">{rub(b.total)}</p>
          <p className="caption">оплачено {rub(b.paid)}</p>
        </div>
      </div>
      {onCancel && (
        <button type="button" className="btn btn-secondary btn-sm mt-4" onClick={onCancel}>
          Отменить бронь
        </button>
      )}
    </li>
  );
}

function MyRating() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<RatingRow | null | undefined>(undefined);
  const find = (e: FormEvent) => {
    e.preventDefault();
    const needle = q.trim().toLowerCase().replace(/ё/g, "е");
    if (!needle) return;
    setResult(LEAGUES[0].rows.find((r) => r.name.toLowerCase().replace(/ё/g, "е") === needle) ?? null);
  };
  return (
    <section className="card p-5 md:p-6" aria-labelledby="my-rating">
      <h2 id="my-rating" className="display text-[28px] font-semibold">
        Моё место в рейтинге
      </h2>
      <p className="mt-2 text-[15px] text-muted">
        Профиль пока не связан с таблицей лиги. Найдите себя по фамилии.
      </p>
      <form onSubmit={find} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Фамилия</span>
          <input className="field" placeholder="Фамилия" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-secondary">
          Найти
        </button>
      </form>
      <div aria-live="polite">
        {result && (
          <p className="mt-4">
            <span className="font-semibold">{result.name}</span>: место{" "}
            <span className="mono accent-num font-bold">{result.place}</span>, очков{" "}
            <span className="mono">{result.points}</span>.{" "}
            <Link to="/rating" className="underline underline-offset-4">
              Весь рейтинг
            </Link>
          </p>
        )}
        {result === null && (
          <p className="mt-4 text-muted">
            Такой фамилии в таблице нет.{" "}
            <Link to="/rating" className="text-ink underline underline-offset-4">
              Открыть весь рейтинг
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

export default function AccountPage() {
  const { user, logout, bookings, cancelBooking, now } = useApp();
  const [cancelId, setCancelId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="wrap max-w-[480px] pb-16 pt-8 md:pt-16">
        <h1 className="h2">Вход в кабинет</h1>
        <p className="mb-6 mt-3 text-muted">В кабинете хранятся ваши брони. Вход по номеру телефона.</p>
        <div className="card p-5 md:p-7">
          <AuthForm />
        </div>
      </div>
    );
  }

  const mine = bookings.filter((b) => b.phone === user.phone);
  const upcoming = mine
    .filter((b) => !b.cancelled && isUpcoming(b, now.date, now.min))
    .sort((a, b) => (a.date + String(a.start).padStart(4, "0")).localeCompare(b.date + String(b.start).padStart(4, "0")));
  const past = mine.filter((b) => !upcoming.includes(b)).sort((a, b) => b.createdAt - a.createdAt);
  const toCancel = mine.find((b) => b.id === cancelId);

  return (
    <div className="wrap max-w-[860px] pb-16 pt-8 md:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2">Личный кабинет</h1>
          <p className="mono mt-3 text-muted">{prettyPhone(user.phone)}</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>
          Выйти
        </button>
      </div>

      <section className="mt-9" aria-labelledby="upcoming">
        <h2 id="upcoming" className="display text-[28px] font-semibold">
          Предстоящие брони
        </h2>
        {upcoming.length ? (
          <ul className="mt-4 grid gap-3">
            {upcoming.map((b) => (
              <BookingCard key={b.id} b={b} upcoming onCancel={() => setCancelId(b.id)} />
            ))}
          </ul>
        ) : (
          <div className="card mt-4 flex flex-col items-start gap-4 p-5 md:p-6">
            <p className="text-muted">Предстоящих броней нет. Свободные слоты видно в сетке на две недели вперёд.</p>
            <Link to="/booking" className="btn btn-primary">
              Забронировать корт
            </Link>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-9" aria-labelledby="past">
          <h2 id="past" className="display text-[28px] font-semibold">
            Прошедшие и отменённые
          </h2>
          <ul className="mt-4 grid gap-3">
            {past.map((b) => (
              <BookingCard key={b.id} b={b} upcoming={false} />
            ))}
          </ul>
        </section>
      )}

      <div className="mt-9">
        <MyRating />
      </div>

      {toCancel && (
        <Modal title="Отменить бронь?" onClose={() => setCancelId(null)}>
          <p className="text-muted">
            {VENUES[toCancel.venueId].name}, корт {toCancel.court},{" "}
            {dateLabel(toCancel.date, { day: "numeric", month: "long" })},{" "}
            <span className="mono">
              {fmtTime(toCancel.start)}–{fmtTime(toCancel.start + toCancel.dur)}
            </span>
            . Слот снова станет свободным, предоплата {rub(toCancel.paid)} вернётся на карту.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => {
                cancelBooking(toCancel.id);
                setCancelId(null);
              }}
            >
              Отменить бронь
            </button>
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setCancelId(null)}>
              Оставить
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
