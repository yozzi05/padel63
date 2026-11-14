import { Search } from "lucide-react";
import { useState } from "react";
import { LEAGUES, type LeagueId } from "../data/rating";
import { LeagueTabs, RatingTable } from "../sections/HomeSections";

export default function RatingPage() {
  const [league, setLeague] = useState<LeagueId>("c");
  const [q, setQ] = useState("");
  const all = LEAGUES.find((l) => l.id === league)!.rows;
  const needle = q.trim().toLowerCase().replace(/ё/g, "е");
  const rows = needle ? all.filter((r) => r.name.toLowerCase().replace(/ё/g, "е").includes(needle)) : all;

  return (
    <div className="wrap max-w-[860px] pb-16 pt-8 md:pt-12">
      <h1 className="h2">Рейтинг лиги</h1>
      <p className="mt-3 text-muted">Игроки с равными очками делят место. Всего в таблице {all.length} участников.</p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LeagueTabs value={league} onChange={setLeague} />
        <label className="relative block sm:w-[280px]">
          <span className="sr-only">Поиск по фамилии</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            className="field !h-12 !bg-surface !pl-11"
            placeholder="Поиск по фамилии"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>

      <div className="card mt-5 overflow-hidden" role="tabpanel">
        {rows.length ? (
          <RatingTable rows={rows} />
        ) : (
          <p className="p-6 text-muted">
            Игрока с такой фамилией в таблице нет. Проверьте написание или сыграйте турнир, чтобы попасть в рейтинг.
          </p>
        )}
      </div>
      <p className="caption mt-3" aria-live="polite">
        {needle ? `Найдено: ${rows.length}` : "Динамика мест появится, когда клуб начнёт передавать историю турниров."}
      </p>
    </div>
  );
}
