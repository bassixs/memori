import type { FilmId } from './films'
import type { PlatformId } from './distribution'

/**
 * Статистика проекта. Неизвестные значения — null.
 * Блок «Результаты» показывает только заполненные показатели.
 *
 * Итоги (totals) по умолчанию считаются автоматически как сумма по роликам —
 * если показатель заполнен у всех четырёх роликов. Чтобы задать итог вручную,
 * впишите число в totals.
 */
export type MetricKey = 'views' | 'engagement' | 'reach'

export const metricMeta: Record<MetricKey, { label: string; short: string; approx?: boolean }> = {
  views: { label: 'просмотров', short: 'Просмотры' },
  engagement: { label: 'реакций, комментариев и репостов', short: 'Реакции' },
  reach: { label: 'виральный охват', short: 'Виральный охват', approx: true },
}

export interface Stats {
  /** Дата актуальности данных, например '2026-11-18' */
  updatedAt: string | null
  byFilm: Record<FilmId, Record<MetricKey, number | null>>
  /** Ручные итоги; null — посчитать сумму по роликам */
  totals: Record<MetricKey, number | null> & { placements: number | null }
  byPlatform: Record<PlatformId, { views: number | null; placements: number | null }>
  /** Прочие фактические показатели: [{ label: 'новых подписчиков', value: 1200 }] */
  extra: { label: string; value: number; prefix?: string; suffix?: string }[]
}

export const stats: Stats = {
  updatedAt: null,
  byFilm: {
    ivan: { views: 81_205, engagement: 455, reach: 40_000 },
    zhukov: { views: 88_159, engagement: 1_262, reach: 45_000 },
    kurchatov: { views: 77_530, engagement: 536, reach: 37_000 },
    cosmos: { views: 45_386, engagement: 265, reach: 24_000 },
  },
  totals: { views: null, engagement: null, reach: null, placements: null },
  byPlatform: {
    vk: { views: null, placements: null },
    telegram: { views: null, placements: null },
    max: { views: null, placements: null },
    ok: { views: null, placements: null },
  },
  extra: [],
}

/** Итог показателя: ручной или сумма по всем роликам (если заполнены у всех) */
export function total(key: MetricKey): number | null {
  if (stats.totals[key] !== null) return stats.totals[key]
  const values = Object.values(stats.byFilm).map((f) => f[key])
  return values.every((v) => v !== null) ? (values as number[]).reduce((a, b) => a + b, 0) : null
}
