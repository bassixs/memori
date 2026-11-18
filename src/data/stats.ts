import type { FilmId } from './films'
import type { PlatformId } from './distribution'

/**
 * Статистика проекта. Все неизвестные значения — null.
 * Блок «Результаты» показывает только заполненные показатели;
 * пока всё null — выводится аккуратная заглушка без цифр.
 */
export interface Stats {
  /** Дата актуальности данных, например '2026-12-01' */
  updatedAt: string | null
  totals: {
    views: number | null
    placements: number | null
    reactions: number | null
    reposts: number | null
  }
  byPlatform: Record<PlatformId, { views: number | null; placements: number | null }>
  byFilm: Record<FilmId, { views: number | null }>
  /** Прочие фактические показатели: [{ label: 'Охват', value: 120000, suffix: '' }] */
  extra: { label: string; value: number; suffix?: string }[]
}

export const stats: Stats = {
  updatedAt: null,
  totals: { views: null, placements: null, reactions: null, reposts: null },
  byPlatform: {
    vk: { views: null, placements: null },
    telegram: { views: null, placements: null },
    max: { views: null, placements: null },
    ok: { views: null, placements: null },
  },
  byFilm: {
    ivan: { views: null },
    zhukov: { views: null },
    kurchatov: { views: null },
    cosmos: { views: null },
  },
  extra: [],
}

export const totalLabels: Record<keyof Stats['totals'], string> = {
  views: 'просмотров',
  placements: 'размещений',
  reactions: 'реакций',
  reposts: 'репостов',
}
