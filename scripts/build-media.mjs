/**
 * Сборка производных медиафайлов для сайта.
 *
 * Исходники НЕ изменяются: скрипт только читает папку с материалами
 * и пишет результаты в public/media.
 *
 *   node scripts/build-media.mjs [путь_к_папке_Летопись]
 *   FORCE=1 node scripts/build-media.mjs   — пересобрать всё заново
 *
 * Что делает:
 *  1. Конвертирует все изображения из «Картинки» в WebP (960w и 480w).
 *  2. Копирует итоговые ролики («ролик N.mp4») в public/media/films/<id>.mp4
 *     БЕЗ перекодирования — только перепаковка с +faststart (moov в начале файла,
 *     чтобы видео начинало играть до полной загрузки).
 *  3. Делает кадр-постер из ролика (на случай, если понадобится).
 *  4. Пишет src/data/media-manifest.json — карту «производный файл → исходник».
 *
 * Требуется ffmpeg/ffprobe в PATH.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = process.argv[2] ?? path.resolve(ROOT, '..', 'Летопись-20261116T083913Z-1-001', 'Летопись')
const OUT = path.join(ROOT, 'public', 'media')
const FORCE = process.env.FORCE === '1'

const FILMS = [
  { id: 'ivan', dir: 'Ролик 1 - Иван III', final: 'ролик 1.mp4' },
  { id: 'zhukov', dir: 'Ролик 2 - Г.К. Жуков', final: 'ролик 2.mp4' },
  { id: 'kurchatov', dir: 'Ролик 3 - И.В. Курчатов', final: 'ролик 3.mp4' },
  { id: 'cosmos', dir: 'Ролик 4 - А.Ю. Гагарин и К.Э. Циолковский', final: 'ролик 4.mp4' },
]

const TR = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}
const slug = (s) =>
  s.toLowerCase().split('').map((c) => TR[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-v', 'error', '-y', ...args], { stdio: 'inherit' })
const probe = (f) => {
  const j = JSON.parse(
    execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', f]).toString(),
  )
  return { width: j.streams[0].width, height: j.streams[0].height, duration: Math.round(Number(j.format.duration) * 10) / 10 }
}
const fresh = (out) => FORCE || !fs.existsSync(out)

if (!fs.existsSync(SRC)) {
  console.error(`Папка с материалами не найдена: ${SRC}`)
  process.exit(1)
}

const manifest = { generated: new Date().toISOString(), source: path.relative(ROOT, SRC).split(path.sep).join("/"), films: {} }
fs.mkdirSync(path.join(OUT, 'films'), { recursive: true })

for (const film of FILMS) {
  const base = path.join(SRC, film.dir)
  const imgDir = path.join(base, 'Картинки')
  const outImg = path.join(OUT, 'img', film.id)
  fs.mkdirSync(outImg, { recursive: true })

  const images = {}
  for (const file of fs.readdirSync(imgDir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort()) {
    const key = slug(path.parse(file).name)
    for (const w of [960, 480]) {
      const out = path.join(outImg, `${key}-${w}.webp`)
      if (fresh(out)) ff(['-i', path.join(imgDir, file), '-vf', `scale=${w}:-2:flags=lanczos`, '-quality', w > 500 ? '80' : '74', out])
    }
    images[key] = { source: path.join(film.dir, 'Картинки', file), src: `media/img/${film.id}/${key}-960.webp`, srcSmall: `media/img/${film.id}/${key}-480.webp` }
  }

  const finalSrc = path.join(base, film.final)
  if (!fs.existsSync(finalSrc)) throw new Error(`Не найден итоговый ролик: ${finalSrc}`)
  const outVideo = path.join(OUT, 'films', `${film.id}.mp4`)
  if (fresh(outVideo)) {
    console.log(`[${film.id}] перепаковка ${film.final} (+faststart, без перекодирования)`)
    ff(['-i', finalSrc, '-map', '0', '-c', 'copy', '-movflags', '+faststart', outVideo])
  }
  const poster = path.join(OUT, 'films', `${film.id}-frame.webp`)
  if (fresh(poster)) ff(['-ss', '1', '-i', outVideo, '-frames:v', '1', '-vf', 'scale=480:-2', '-quality', '72', poster])

  const meta = probe(outVideo)
  manifest.films[film.id] = {
    video: { src: `media/films/${film.id}.mp4`, source: path.join(film.dir, film.final), frame: `media/films/${film.id}-frame.webp`, ...meta },
    clips: fs.readdirSync(path.join(base, 'Видео')).filter((f) => f.endsWith('.mp4')).length,
    images,
  }
  console.log(`[${film.id}] ${meta.width}×${meta.height}, ${meta.duration} c, изображений: ${Object.keys(images).length}`)
}

const manPath = path.join(ROOT, 'src', 'data', 'media-manifest.json')
fs.writeFileSync(manPath, JSON.stringify(manifest, null, 2))
console.log(`Готово. Манифест: ${manPath}`)
