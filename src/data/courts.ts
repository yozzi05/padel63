import type { VenueId } from "./club";

// ДЕМО-ДАННЫЕ, уточнить у клуба
// Количество кортов на площадках: на сайте клуба его нет.
export const COURTS: Record<VenueId, number[]> = {
  embankment: [1, 2, 3],
  highway: [1],
};

// ДЕМО-ДАННЫЕ, уточнить у клуба
// Сезон открытых кортов. false → на «Набережной» показывается «Закрыто до весны»,
// табло и сетка бронирования предлагают перейти на «Шоссейную».
export const seasonOpen = true;

export const TOTAL_COURTS = Object.values(COURTS).reduce((n, list) => n + list.length, 0);
