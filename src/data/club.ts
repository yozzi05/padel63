// Данные клуба. Реальные взяты с padelclub63.ru, заглушки помечены отдельно.
// При подключении API этот файл заменяется ответом бэкенда.

export type VenueId = "embankment" | "highway";

export interface Venue {
  id: VenueId;
  name: string;
  address: string;
  landmark: string;
  courtType: string;
  outdoor: boolean;
  amenities: string[];
  /** Ссылка «Маршрут» в Яндекс Картах */
  routeUrl: string;
  /** Адрес встраиваемой карты */
  mapEmbedUrl: string;
  /** Путь к реальному фото площадки. Пока пусто: показывается заглушка. */
  photo?: string;
  photoCaption: string;
}

export const CLUB = {
  name: "Padel63",
  legal: "ООО «СМЭШ Волга»",
  slogan: ["Играй", "Развивайся", "Побеждай"],
  phone: "+7 (902) 321-00-63",
  phoneHref: "tel:+79023210063",
  email: "Padel.samara@mail.ru",
  telegram: "https://t.me/padelsamara",
  instagram: "https://www.instagram.com/padel_63",
  timezone: "Europe/Samara",
  /** Часы работы в минутах от полуночи: 07:00–00:00 ежедневно */
  openMin: 7 * 60,
  closeMin: 24 * 60,
  hoursLabel: "07:00–00:00",
} as const;

const EMB_LAT = 53.207826;
const EMB_LON = 50.113389;
const HIGHWAY_QUERY = encodeURIComponent("Самара, улица Шоссейная, 153");

export const VENUES: Record<VenueId, Venue> = {
  embankment: {
    id: "embankment",
    name: "Набережная",
    address: "Волжский просп., 36Б",
    landmark: "Самарская набережная, у «Чайхоны №1»",
    courtType: "Открытые корты",
    outdoor: true,
    amenities: ["Раздевалки от «Чайхоны»", "Душевые", "Освещение"],
    routeUrl: `https://yandex.ru/maps/?rtext=~${EMB_LAT},${EMB_LON}&rtt=auto`,
    mapEmbedUrl: `https://yandex.ru/map-widget/v1/?ll=${EMB_LON}%2C${EMB_LAT}&z=16&pt=${EMB_LON}%2C${EMB_LAT}%2Cpm2gnm`,
    photoCaption: "Фото площадки на набережной",
  },
  highway: {
    id: "highway",
    name: "Шоссейная",
    address: "ул. Шоссейная, 153",
    landmark: "Закрытый корт под крышей",
    courtType: "Закрытый корт",
    outdoor: false,
    amenities: ["Игра круглый год", "Не зависит от погоды", "Освещение"],
    // Точных координат на сайте клуба нет: ссылка открывает поиск по адресу
    routeUrl: `https://yandex.ru/maps/?text=${HIGHWAY_QUERY}`,
    mapEmbedUrl: `https://yandex.ru/map-widget/v1/?mode=search&text=${HIGHWAY_QUERY}&z=16`,
    photoCaption: "Фото закрытого корта",
  },
};

export const VENUE_IDS: VenueId[] = ["embankment", "highway"];

/** Прокат: реальные цены с сайта клуба */
export const RENTAL = {
  racket: 300,
  balls: 1000,
  ballsLabel: "Набор мячей (3 шт.)",
} as const;

// ДЕМО-ДАННЫЕ, уточнить у клуба
// Цена корта одинакова на обеих площадках.
export const PRICES: { dur: number; label: string; price: number }[] = [
  { dur: 60, label: "1 час", price: 3000 },
  { dur: 90, label: "1,5 часа", price: 4500 },
  { dur: 120, label: "2 часа", price: 6000 },
];

// ДЕМО-ДАННЫЕ, уточнить у клуба
// Условная погода для плашки «Открытые корты». Заменить на погодный API.
export const WEATHER_DEMO = { temp: "+16°", text: "без осадков, ветер 3 м/с" };

export const SHOP = [
  { title: "Мячи", text: "Наборы для игры и тренировок" },
  { title: "Ракетки", text: "Для новичков и опытных игроков" },
  { title: "Бутылки", text: "Спортивные бутылки для воды" },
];

export const TRAINING = [
  {
    title: "Обучение с нуля",
    text: "Тренер покажет хват, подачу и игру от стекла. Уже на первом занятии вы сыграете настоящий розыгрыш.",
  },
  {
    title: "Индивидуальные занятия",
    text: "Тренировка один на один под ваш уровень и цели. Разбираем технику и исправляем ошибки.",
  },
  {
    title: "Групповые тренировки",
    text: "Регулярные занятия для новичков и опытных игроков. В группе проще найти партнёров для игры.",
  },
];
