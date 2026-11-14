import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { CourtArt } from "../components/CourtArt";
import { scrollToId } from "../components/ui";
import { CLUB, PRICES } from "../data/club";
import { TOTAL_COURTS } from "../data/courts";
import { fmtTime, rub } from "../lib/time";
import { useApp } from "../state/AppContext";

export function Hero() {
  const { now } = useApp();
  const stats = [
    { value: `${TOTAL_COURTS} корта`, label: "на двух площадках" },
    { value: CLUB.hoursLabel, label: "без выходных" },
    { value: `от ${rub(PRICES[0].price)}`, label: "за корт в час" },
  ];
  return (
    <section className="overflow-hidden border-b border-line">
      <div className="wrap grid grid-cols-1 items-center gap-8 pb-10 pt-8 md:pb-16 md:pt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="mono mb-5 inline-flex min-h-[36px] items-center gap-2 rounded-full border border-line px-3.5 text-[14px] text-muted">
            <Clock size={15} aria-hidden />
            Сейчас <span className="text-ink">{fmtTime(now.min)}</span> по Самаре
          </p>
          <h1 className="h1">Падел в&nbsp;Самаре: на набережной и&nbsp;под&nbsp;крышей</h1>
          <p className="mt-5 max-w-[560px] text-muted md:text-[19px]">
            Открытые корты у Волги и закрытый корт на Шоссейной. Бронируйте онлайн: видно, какой корт свободен прямо
            сейчас.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/booking" className="btn btn-primary">
              Забронировать корт
            </Link>
            <button type="button" className="btn btn-secondary" onClick={() => scrollToId("first")}>
              Я впервые
            </button>
          </div>
          <dl className="mt-9 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-line pt-6 min-[520px]:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="flex items-baseline gap-3 min-[520px]:block">
                <dt className="display whitespace-nowrap text-[27px] font-semibold md:text-[31px]">{s.value}</dt>
                <dd className="caption min-[520px]:mt-1">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <span
            aria-hidden
            className="big63 pointer-events-none absolute -right-3 -top-2 select-none text-[332px] sm:text-[455px] lg:-right-6 lg:text-[525px]"
          >
            63
          </span>
          <CourtArt className="relative mt-16 w-full sm:mt-24" />
        </div>
      </div>
    </section>
  );
}

export function Marquee() {
  const text = CLUB.slogan.map((s) => s.toUpperCase()).join(" · ") + " · ";
  const chunk = Array.from({ length: 6 }, () => text).join("");
  return (
    <div className="overflow-hidden bg-lime py-3.5 text-night" role="img" aria-label="Играй. Развивайся. Побеждай.">
      <div className="marquee-track display text-[25px] font-extrabold md:text-[31px]" aria-hidden>
        <span className="whitespace-pre pr-0">{chunk}</span>
        <span className="whitespace-pre">{chunk}</span>
      </div>
    </div>
  );
}
