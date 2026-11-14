import { ArrowRight, Check, Instagram, Mail, MapPin, Navigation, Phone, Send } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CourtScheme } from "../components/CourtArt";
import { Reveal, SectionHead } from "../components/ui";
import { CLUB, PRICES, RENTAL, SHOP, TRAINING, VENUE_IDS, VENUES, type Venue } from "../data/club";
import { COURTS } from "../data/courts";
import { LEAGUES, type LeagueId, type RatingRow } from "../data/rating";
import { rub } from "../lib/time";
import { useApp } from "../state/AppContext";

/* ---------- 4. Две площадки ---------- */

function VenuePhoto({ venue }: { venue: Venue }) {
  // Когда появятся реальные фото, достаточно указать venue.photo в data/club.ts
  if (venue.photo) {
    return <img src={venue.photo} alt={`Площадка «${venue.name}»`} loading="lazy" className="h-full w-full object-cover" />;
  }
  return (
    <div
      className="flex h-full w-full items-end p-5"
      style={{
        background: venue.outdoor
          ? "linear-gradient(160deg, #2F5BEA 0%, #1B2F78 55%, #0C0D0A 100%)"
          : "linear-gradient(160deg, #3A3D2C 0%, #1E2016 55%, #0C0D0A 100%)",
      }}
    >
      <span className="caption !text-[#C8CABD]">{venue.photoCaption}</span>
    </div>
  );
}

export function Venues() {
  const { setVenue, venueId } = useApp();
  const navigate = useNavigate();
  return (
    <section className="section border-t border-line">
      <div className="wrap">
        <Reveal>
          <SectionHead title="Две площадки" sub="Летом играем у Волги, в непогоду и зимой уходим под крышу." />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          {VENUE_IDS.map((id) => {
            const v = VENUES[id];
            const n = COURTS[id].length;
            return (
              <Reveal key={id}>
                <article className="card flex h-full flex-col overflow-hidden">
                  <div className="aspect-[16/9] w-full">
                    <VenuePhoto venue={v} />
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-7">
                    <p className="caption">
                      {v.courtType} · {n} {n === 1 ? "корт" : "корта"}
                    </p>
                    <h3 className="display mt-2 text-[34px] font-semibold md:text-[39px]">{v.name}</h3>
                    <p className="mt-3 flex items-start gap-2">
                      <MapPin size={18} className="mt-1 shrink-0" aria-hidden />
                      <span>
                        {v.address}
                        <span className="block text-[15px] text-muted">{v.landmark}</span>
                      </span>
                    </p>
                    <ul className="mt-4 grid gap-1.5 text-[15px] text-muted">
                      {v.amenities.map((a) => (
                        <li key={a} className="flex items-center gap-2">
                          <Check size={16} className="shrink-0 text-ink" aria-hidden /> {a}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={`btn mt-6 self-start ${venueId === id ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => {
                        setVenue(id);
                        navigate("/", { state: { scrollTo: "courts" } });
                      }}
                    >
                      Смотреть слоты
                    </button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. Цены ---------- */

export function Prices() {
  return (
    <section id="prices" className="section border-t border-line">
      <div className="wrap">
        <Reveal>
          <SectionHead title="Цены" sub="Цена за корт, а не за игрока. Одинаково на обеих площадках." />
        </Reveal>
        <Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {PRICES.map((p) => (
              <article key={p.dur} className="card p-6 md:p-7">
                <h3 className="text-[17px] font-semibold text-muted">{p.label}</h3>
                <p className="display mt-3 whitespace-nowrap text-[48px] font-extrabold leading-none md:text-[56px]">
                  {rub(p.price)}
                </p>
                <p className="caption mt-4">≈ {rub(p.price / 4)} с игрока при игре вчетвером</p>
              </article>
            ))}
          </div>
          <div className="card mt-4 flex flex-col gap-x-10 gap-y-3 p-6 md:flex-row md:items-center md:p-7">
            <h3 className="font-semibold">Прокат</h3>
            <p className="flex items-baseline justify-between gap-4 md:justify-start">
              <span className="text-muted">Ракетка</span>
              <span className="mono">{rub(RENTAL.racket)}</span>
            </p>
            <p className="flex items-baseline justify-between gap-4 md:justify-start">
              <span className="text-muted">{RENTAL.ballsLabel}</span>
              <span className="mono">{rub(RENTAL.balls)}</span>
            </p>
            <Link to="/booking" className="btn btn-primary md:ml-auto">
              Выбрать время
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 6. Тренировки ---------- */

export function Training() {
  return (
    <section id="training" className="section border-t border-line">
      <div className="wrap">
        <Reveal>
          <SectionHead title="Тренировки" sub="Запись через Telegram клуба: администратор подберёт тренера и время." />
        </Reveal>
        <Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {TRAINING.map((t, i) => (
              <article key={t.title} className="card flex flex-col p-6 md:p-7">
                <p className="mono text-[14px] text-muted">0{i + 1}</p>
                <h3 className="display mt-3 text-[28px] font-semibold leading-tight">{t.title}</h3>
                <p className="mt-3 flex-1 text-muted">{t.text}</p>
                <a href={CLUB.telegram} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-6">
                  <Send size={18} aria-hidden /> Записаться
                </a>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 7. Я впервые ---------- */

const FIRST = [
  { title: "Легко начать", text: "Подача снизу и небольшой корт: розыгрыши получаются уже на первой игре." },
  { title: "Для любого возраста", text: "Нагрузка мягче, чем в теннисе. Играют и школьники, и их родители." },
  { title: "Играют парами", text: "Всегда двое на двое, поэтому падел удобно совмещать с встречей друзей." },
];

export function FirstTime() {
  return (
    <section id="first" className="section border-t border-line">
      <div className="wrap grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 className="h2">Первый раз на корте?</h2>
          <p className="mt-4 text-muted">
            Падел сочетает теннис и сквош: играют двое на двое, мяч может отскакивать от стеклянных стен. Ракетку и мячи
            можно взять в клубе.
          </p>
          <ul className="mt-7 grid gap-5">
            {FIRST.map((f, i) => (
              <li key={f.title} className="flex gap-4">
                <span className="mono mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-[14px]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-[15px] text-muted">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <a href={CLUB.telegram} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-8 w-full sm:w-auto">
            Записаться на первое занятие
          </a>
        </Reveal>
        <Reveal>
          <figure className="card p-4 md:p-7">
            <CourtScheme />
            <figcaption className="caption mt-3">
              Корт 10×20 м. Он втрое меньше теннисного, поэтому до мяча легче добежать.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 8. Рейтинг ---------- */

export function LeagueTabs({ value, onChange }: { value: LeagueId; onChange: (id: LeagueId) => void }) {
  return (
    <div role="tablist" aria-label="Лига" className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
      {LEAGUES.map((l) => (
        <button
          key={l.id}
          type="button"
          role="tab"
          aria-selected={value === l.id}
          onClick={() => onChange(l.id)}
          className={`h-11 rounded-full px-5 text-[15px] font-semibold ${
            value === l.id ? "bg-ink text-bg" : "text-muted hover:text-ink"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function RatingTable({ rows }: { rows: RatingRow[] }) {
  return (
    <table className="w-full table-fixed border-collapse text-left">
      <thead>
        <tr className="caption border-b border-line">
          <th scope="col" className="w-[72px] py-3 pl-4 font-medium md:w-[110px] md:pl-6">
            Место
          </th>
          <th scope="col" className="py-3 font-medium">
            Фамилия
          </th>
          <th scope="col" className="w-[84px] py-3 pr-4 text-right font-medium md:w-[120px] md:pr-6">
            Очки
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="border-b border-line last:border-0">
            <td className="py-3.5 pl-4 md:pl-6">
              <span className={`mono text-[17px] ${r.place <= 3 ? "accent-num font-bold" : "text-muted"}`}>{r.place}</span>
            </td>
            <td className="truncate py-3.5 font-medium">{r.name}</td>
            <td className="mono py-3.5 pr-4 text-right md:pr-6">{r.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RatingTeaser() {
  const [league, setLeague] = useState<LeagueId>("c");
  const rows = LEAGUES.find((l) => l.id === league)!.rows.slice(0, 5);
  return (
    <section id="rating" className="section border-t border-line">
      <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-16">
        <Reveal>
          <h2 className="h2">Рейтинг лиги</h2>
          <p className="mt-4 text-muted">
            Клубная лига идёт весь сезон. Очки начисляются за турниры, игроки с равными очками делят место.
          </p>
          <div className="mt-6">
            <LeagueTabs value={league} onChange={setLeague} />
          </div>
          <Link
            to="/rating"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-semibold underline underline-offset-4"
          >
            Весь рейтинг <ArrowRight size={18} aria-hidden />
          </Link>
        </Reveal>
        <Reveal>
          <div className="card overflow-hidden" role="tabpanel">
            <RatingTable rows={rows} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 9. Магазин ---------- */

export function Shop() {
  return (
    <section className="section border-t border-line">
      <div className="wrap">
        <Reveal>
          <SectionHead title="Магазин" sub="Можно купить на кассе клуба." />
        </Reveal>
        <Reveal>
          <ul className="grid gap-4 sm:grid-cols-3">
            {SHOP.map((s) => (
              <li key={s.title} className="card p-6 md:p-7">
                <h3 className="display text-[28px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-[15px] text-muted">{s.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 10. Как забронировать ---------- */

const STEPS = [
  { title: "Выберите время", text: "Площадка, день и свободный слот в сетке. Занятые слоты видно сразу." },
  { title: "Внесите предоплату", text: "50% или вся сумма онлайн. Вход по номеру телефона, без пароля." },
  { title: "Приходите играть", text: "Бронь хранится в личном кабинете. Ракетки и мячи можно взять на месте." },
];

export function HowTo() {
  return (
    <section className="section border-t border-line">
      <div className="wrap">
        <Reveal>
          <SectionHead title="Как забронировать" />
        </Reveal>
        <Reveal>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card p-6 md:p-7">
                <span className="display accent-num text-[48px] font-extrabold leading-none">{i + 1}</span>
                <h3 className="mt-4 text-[19px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-[15px] text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link to="/booking" className="btn btn-primary mt-6 w-full sm:w-auto">
            Забронировать корт
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 11. Контакты ---------- */

export function Contacts() {
  const { venue, venueId, setVenue } = useApp();
  const link = "flex min-h-[48px] items-center gap-3 font-medium hover:text-muted";
  return (
    <section id="contacts" className="section border-t border-line">
      <div className="wrap">
        <Reveal>
          <SectionHead title="Контакты" sub={`Работаем ежедневно, ${CLUB.hoursLabel}.`} />
        </Reveal>
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="grid gap-4">
              {VENUE_IDS.map((id) => {
                const v = VENUES[id];
                const active = id === venueId;
                return (
                  <article key={id} className={`card p-5 md:p-6 ${active ? "!border-[color:var(--text-muted)]" : ""}`}>
                    <p className="caption">{v.courtType}</p>
                    <h3 className="display mt-1 text-[28px] font-semibold">{v.name}</h3>
                    <p className="mt-2">{v.address}</p>
                    <p className="text-[15px] text-muted">{v.landmark}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a href={v.routeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                        <Navigation size={17} aria-hidden /> Маршрут
                      </a>
                      {!active && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setVenue(id)}>
                          Показать на карте
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
              <div className="card grid p-5 sm:grid-cols-2 sm:gap-x-6 md:p-6">
                <a href={CLUB.phoneHref} className={link}>
                  <Phone size={18} aria-hidden /> <span className="mono whitespace-nowrap">{CLUB.phone}</span>
                </a>
                <a href={CLUB.telegram} target="_blank" rel="noopener noreferrer" className={link}>
                  <Send size={18} aria-hidden /> Telegram
                </a>
                <a href={`mailto:${CLUB.email}`} className={`${link} break-all`}>
                  <Mail size={18} className="shrink-0" aria-hidden /> {CLUB.email}
                </a>
                <a href={CLUB.instagram} target="_blank" rel="noopener noreferrer" className={link}>
                  <Instagram size={18} aria-hidden /> Instagram
                </a>
              </div>
            </div>
            <div className="card min-h-[320px] overflow-hidden lg:min-h-0">
              <iframe
                key={venueId}
                title={`Карта: площадка «${venue.name}», ${venue.address}`}
                src={venue.mapEmbedUrl}
                loading="lazy"
                className="h-full min-h-[320px] w-full border-0"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
