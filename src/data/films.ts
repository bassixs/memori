import { asset, img, localVideo, type ImageRef } from '../lib/media'
import type { PlatformId } from './distribution'

export type FilmId = 'ivan' | 'zhukov' | 'kurchatov' | 'cosmos'

export interface Film {
  id: FilmId
  /** Порядковый номер «01»…«04» */
  number: string
  title: string
  /** Заголовок по строкам для крупной типографики */
  titleLines: string[]
  /** Короткое имя для индикаторов и кнопок */
  short: string
  heroes: string[]
  subtitle: string
  description: string
  /** Акцентный цвет, взятый из кадров ролика */
  accent: string
  /**
   * Итоговый ролик: локальный путь от public/ (media/films/…) или внешний https-URL.
   * Чтобы раздавать видео с CDN/хостинга, просто замените src на полный URL.
   */
  video: { src: string }
  poster: ImageRef
  /** object-position постера, чтобы лицо героя не обрезалось */
  posterPosition: string
  /** Ширина / высота видео */
  aspectRatio: number
  /** Длительность ролика в секундах; null — неизвестна (плеер возьмёт из метаданных) */
  duration: number | null
  /** Ссылки на публикации ролика по площадкам; null — ещё не опубликован / нет данных */
  publications: Record<PlatformId, string | null>
  /** Кадры для раздела «Реализация» и героя */
  stills: ImageRef[]
}

const noLinks = (): Record<PlatformId, string | null> => ({ vk: null, telegram: null, max: null, ok: null })

export const films: Film[] = [
  {
    id: 'ivan',
    number: '01',
    title: 'Иван III',
    titleLines: ['Иван', 'III'],
    short: 'Иван III',
    heroes: ['Иван III'],
    subtitle: 'Стояние на Угре, 1480',
    description:
      'Осень 1480 года: два войска на берегах Угры и конец ордынской зависимости. Река, всадники, пушкари и белокаменная Москва — в бумажных диорамах.',
    accent: '#7a2d22',
    video: { src: localVideo('ivan').src },
    poster: img('ivan', 'ivan-iii-pered-gladkim-bordovym-znamenem-5', 'Иван III в ставке'),
    posterPosition: '50% 30%',
    aspectRatio: 9 / 16,
    duration: localVideo('ivan').duration,
    publications: noLinks(),
    stills: [
      img('ivan', 'ugra-1480-osennyaya-bumazhnaya-diorama-1'),
      img('ivan', 'khan-akhmat-na-kone-u-ugry-3'),
      img('ivan', 'pushkar-i-luchniki-na-beregu-ugry-6'),
      img('ivan', 'srednevekovaya-moskva-v-bumazhnoy-miniatyure-13'),
      img('ivan', 'russkiy-luchnik-u-reki-ugry'),
      img('ivan', 'bumazhnye-voyska-na-dvukh-beregakh'),
    ],
  },
  {
    id: 'zhukov',
    number: '02',
    title: 'Георгий Жуков',
    titleLines: ['Георгий', 'Жуков'],
    short: 'Жуков',
    heroes: ['Георгий Константинович Жуков'],
    subtitle: 'От деревенской избы до Берлина',
    description:
      'Путь полководца: детство в калужской деревне, оборона Москвы зимой 1941-го, Берлин 1945-го. Картонные фигуры, штабные карты и зимние декорации.',
    accent: '#4a5230',
    video: { src: localVideo('zhukov').src },
    poster: img('zhukov', 'krupnyy-plan-kartonnogo-portreta-zhukova', 'Портрет маршала Жукова'),
    posterPosition: '50% 25%',
    aspectRatio: 9 / 16,
    duration: localVideo('zhukov').duration,
    publications: noLinks(),
    stills: [
      img('zhukov', 'rassvet-nad-izboy-zhukovykh'),
      img('zhukov', 'snezhnaya-liniya-oborony-pod-moskvoy'),
      img('zhukov', 'palets-kasaetsya-krasnogo-markera-na-karte'),
      img('zhukov', 'razrushennyy-berlin-u-reykhstaga'),
      img('zhukov', 'zimniy-marsh-krasnoarmeytsev'),
      img('zhukov', 'tikhaya-smena-v-zavodskoy-masterskoy'),
    ],
  },
  {
    id: 'kurchatov',
    number: '03',
    title: 'Игорь Курчатов',
    titleLines: ['Игорь', 'Курчатов'],
    short: 'Курчатов',
    heroes: ['Игорь Васильевич Курчатов'],
    subtitle: 'Атом для мирной жизни',
    description:
      'От первого реактора Ф-1 до Обнинской АЭС — первой в мире атомной электростанции. Лаборатории, чертежи и энергия, пришедшая в города.',
    accent: '#2e463b',
    video: { src: localVideo('kurchatov').src },
    poster: img('kurchatov', '01-portrait', 'Игорь Курчатов в кабинете'),
    posterPosition: '50% 30%',
    aspectRatio: 9 / 16,
    duration: localVideo('kurchatov').duration,
    publications: noLinks(),
    stills: [
      img('kurchatov', '06-reactor-f1', 'Реактор Ф-1'),
      img('kurchatov', '02-obninsk-facade', 'Обнинск'),
      img('kurchatov', 'kurchatov-i-assistenty-za-chertezhami'),
      img('kurchatov', '10-steam-turbine', 'Паровая турбина'),
      img('kurchatov', '08-reactor-am1', 'Реактор АМ-1'),
      img('kurchatov', '11-power-grid', 'Энергия — в города'),
    ],
  },
  {
    id: 'cosmos',
    number: '04',
    title: 'Циолковский и Гагарин',
    titleLines: ['Циолковский', 'и Гагарин'],
    short: 'Космос',
    heroes: ['Константин Эдуардович Циолковский', 'Юрий Алексеевич Гагарин'],
    subtitle: 'Калуга — колыбель космонавтики',
    description:
      'Учитель из Калуги, рассчитавший путь в космос, и первый человек, прошедший этот путь. Две эпохи одного города — от чертежа ракеты до первого камня музея космонавтики.',
    accent: '#1d2742',
    video: { src: localVideo('cosmos').src },
    poster: img('cosmos', 'bumazhnaya-kaluga-dvukh-epokh-4', 'Циолковский и Гагарин'),
    posterPosition: '50% 40%',
    aspectRatio: 9 / 16,
    duration: localVideo('cosmos').duration,
    publications: noLinks(),
    stills: [
      img('cosmos', 'bumazhnyy-vzlet-rakety-vostok-8'),
      img('cosmos', 'gagarin-u-illyuminatora-v-bumazhnom-kosmolete-3', 'Гагарин у иллюминатора'),
      img('cosmos', 'tsiolkovskiy-obyasnyaet-traektoriyu-u-doski-5'),
      img('cosmos', 'vostok-nad-bumazhnoy-zemley-9'),
      img('cosmos', 'gagarin-ukladyvaet-pervyy-kamen-13'),
      img('cosmos', 'bumazhnaya-luna-v-okne-tsiolkovskogo'),
    ],
  },
]

export const filmSrc = (f: Film) => asset(f.video.src)
