import manifest from '../data/media-manifest.json'

/** Абсолютные URL (https://…) отдаются как есть, локальные пути — относительно BASE_URL. */
export const asset = (p: string) => (/^(https?:)?\/\//.test(p) ? p : import.meta.env.BASE_URL + p.replace(/^\//, ''))

export type FilmKey = keyof typeof manifest.films

export interface ImageRef {
  src: string
  srcSmall: string
  /** Подпись: из имени исходного файла или заданная вручную */
  caption: string
  film: FilmKey
}

const captionFromSource = (source: string) =>
  source
    .split(/[\\/]/)
    .pop()!
    .replace(/\.[a-z]+$/i, '')
    .replace(/-\d+$/, '')
    .replace(/_/g, ':')
    .replace(/^\d+-/, '')

/** Изображение из папки «Картинки» конкретного ролика по ключу из media-manifest.json. */
export function img(film: FilmKey, key: string, caption?: string): ImageRef {
  const images = manifest.films[film].images as Record<string, { src: string; srcSmall: string; source: string }>
  const entry = images[key]
  if (!entry) throw new Error(`Нет изображения ${film}/${key} — проверьте media-manifest.json`)
  return { src: asset(entry.src), srcSmall: asset(entry.srcSmall), caption: caption ?? captionFromSource(entry.source), film }
}

/** Итоговый ролик из папки проекта (перепакованный с faststart). */
export const localVideo = (film: FilmKey) => {
  const v = manifest.films[film].video
  return { src: v.src, duration: v.duration, aspectRatio: v.width / v.height }
}

export const totals = (() => {
  const f = Object.values(manifest.films)
  return {
    images: f.reduce((s, x) => s + Object.keys(x.images).length, 0),
    clips: f.reduce((s, x) => s + x.clips, 0),
    seconds: f.reduce((s, x) => s + x.video.duration, 0),
  }
})()
